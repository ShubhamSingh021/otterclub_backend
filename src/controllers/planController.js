import MembershipPlan from "../models/MembershipPlan.js";

// @desc    Get all membership plans
// @route   GET /api/v1/plans
// @access  Public
export const getAllPlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find({ active: true }).sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all membership plans (including inactive ones for admin)
// @route   GET /api/v1/plans/admin
// @access  Private/Admin
export const getAdminPlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find().sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a membership plan
// @route   POST /api/v1/plans
// @access  Private/Admin
export const createPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a membership plan
// @route   PUT /api/v1/plans/:id
// @access  Private/Admin
export const updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      res.status(404);
      throw new Error("Plan not found");
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a membership plan
// @route   DELETE /api/v1/plans/:id
// @access  Private/Admin
export const deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);

    if (!plan) {
      res.status(404);
      throw new Error("Plan not found");
    }

    await plan.deleteOne();

    res.status(200).json({
      success: true,
      message: "Plan removed",
    });
  } catch (error) {
    next(error);
  }
};
