import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const mongoUri = "mongodb+srv://otterclub:otter123@cluster0.9lpupc4.mongodb.net/ottersociety?retryWrites=true&w=majority";

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, default: "user" },
  activeMembership: mongoose.Schema.Types.ObjectId,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const membershipSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  userName: String,
  email: String,
  phone: String,
  membershipType: String,
  price: Number,
  startDate: Date,
  expiryDate: Date,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentStatus: String,
  membershipStatus: String,
  benefits: [String],
  upgradeHistory: Array,
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  eventDate: Date,
  eventImage: String,
  price: Number,
});

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bookingId: { type: String, unique: true },
  fullName: String,
  email: String,
  phone: String,
  age: Number,
  gender: String,
  paymentStatus: String,
  attendanceStatus: String,
  registrationStatus: String,
  originalPrice: Number,
  discountedPrice: Number,
  membershipType: String,
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  message: String,
  type: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Membership = mongoose.model("Membership", membershipSchema);
const Event = mongoose.model("Event", eventSchema);
const Registration = mongoose.model("Registration", registrationSchema);
const Notification = mongoose.model("Notification", notificationSchema);

const run = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // 1. Get or create test user
    const email = "testuser@example.com";
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: "Test User 212",
        email,
        password: "password123",
        phone: "9876543210",
        role: "member",
      });
      await user.save();
      console.log("Created fresh test user.");
    } else {
      user.name = "Test User 212";
      user.password = "password123";
      user.role = "member";
      user.phone = "9876543210";
      await user.save();
      console.log("Updated test user password to password123 and phone number.");
    }

    // 2. Setup Active Membership
    await Membership.deleteMany({ user: user._id });
    const membership = await Membership.create({
      user: user._id,
      userName: user.name,
      email: user.email,
      phone: user.phone,
      membershipType: "PRO",
      price: 1499,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days left
      razorpayOrderId: "order_PRO123456",
      razorpayPaymentId: "pay_PROXYZ98765",
      paymentStatus: "paid",
      membershipStatus: "active",
      benefits: [
        "Everything in Elite",
        "20% event discount",
        "Exclusive members-only events",
        "Pro badge",
        "VIP support",
        "Early access booking"
      ],
      upgradeHistory: [
        { from: "BASIC", to: "ELITE", date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), price: 500 },
        { from: "ELITE", to: "PRO", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 700 }
      ]
    });
    
    user.activeMembership = membership._id;
    await user.save();
    console.log("Linked active PRO membership.");

    // Create some historical expired memberships for payment logs
    await Membership.create({
      user: user._id,
      userName: user.name,
      email: user.email,
      phone: user.phone,
      membershipType: "ELITE",
      price: 799,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      razorpayOrderId: "order_ELITE123",
      razorpayPaymentId: "pay_ELITEXYZ123",
      paymentStatus: "paid",
      membershipStatus: "expired",
      benefits: ["Elite benefits"],
    });

    await Membership.create({
      user: user._id,
      userName: user.name,
      email: user.email,
      phone: user.phone,
      membershipType: "BASIC",
      price: 299,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      razorpayOrderId: "order_BASIC123",
      razorpayPaymentId: "pay_BASICXYZ123",
      paymentStatus: "paid",
      membershipStatus: "expired",
      benefits: ["Basic benefits"],
    });
    console.log("Seeded basic and elite payment history logs.");

    // 3. Find or Create Dummy Events for Registrations
    let events = await Event.find({}).limit(2);
    if (events.length < 2) {
      await Event.deleteMany({});
      const e1 = await Event.create({
        title: "Elite Rowing Championship 2026",
        description: "Join the top society rowers for an ultimate race down the river.",
        eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        eventImage: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=800&q=85",
        price: 500,
      });
      const e2 = await Event.create({
        title: "Sunset Yacht Social Networking",
        description: "Network with high profile tech founders on a luxury sunset cruise.",
        eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Past event
        eventImage: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=85",
        price: 1000,
      });
      events = [e1, e2];
      console.log("Created new dummy events.");
    }
    
    const price0 = (typeof events[0].price === 'number' && !isNaN(events[0].price)) ? events[0].price : 500;
    const price1 = (typeof events[1].price === 'number' && !isNaN(events[1].price)) ? events[1].price : 1000;

    // 4. Setup Dummy Registrations
    await Registration.deleteMany({ user: user._id });
    
    // Upcoming event registration
    await Registration.create({
      event: events[0]._id,
      user: user._id,
      bookingId: `BK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      age: 25,
      gender: "male",
      paymentStatus: "completed",
      attendanceStatus: "pending",
      registrationStatus: "registered",
      originalPrice: price0,
      discountedPrice: price0 * 0.8, // 20% membership discount
      membershipType: "PRO",
    });

    // Past event registration (Attended - eligible for certificate & reviews!)
    await Registration.create({
      event: events[1]._id,
      user: user._id,
      bookingId: `BK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      age: 25,
      gender: "male",
      paymentStatus: "completed",
      attendanceStatus: "attended",
      registrationStatus: "approved",
      originalPrice: price1,
      discountedPrice: price1 * 0.8,
      membershipType: "PRO",
    });
    console.log("Linked 2 dummy registrations (one upcoming, one past/attended).");

    // 5. Setup Notifications
    await Notification.deleteMany({ userId: user._id });
    await Notification.create([
      {
        userId: user._id,
        title: "Welcome to Otter PRO!",
        message: "You have upgraded to Otter PRO membership. Explore early booking access, early invitations and 20% discount on all active events.",
        type: "membership",
        read: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user._id,
        title: "Registration Confirmed!",
        message: "Your registration for Elite Rowing Championship 2026 is confirmed. Show your booking QR ticket at entrance.",
        type: "event",
        read: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        userId: user._id,
        title: "Attendance Checked-In!",
        message: "You attended Sunset Yacht Social Networking. Download your participation certificate and leave a review!",
        type: "event",
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }
    ]);
    console.log("Seeded 3 user notifications.");

    console.log("SUCCESSFULLY SET UP TEST ENVIRONMENT.");
  } catch (error) {
    console.error("Error setting up test user:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

run();
