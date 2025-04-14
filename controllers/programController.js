const Program = require('../models/Program');

// @desc    Create new program
// @route   POST /api/v1/programs
exports.createProgram = async (req, res) => {
  try {
    const { title, description, deadline, milestones } = req.body;

    const nonEmptyMilestones = milestones.filter(m => m.trim() !== "");
    const progress = Math.round((nonEmptyMilestones.length / milestones.length) * 100);

    const program = await Program.create({
      title,
      description,
      deadline,
      milestones,
      progress,
    });

    res.status(201).json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all programs
// @route   GET /api/v1/programs
exports.getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.status(200).json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single program
// @route   GET /api/v1/programs/:id
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.status(200).json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a program
// @route   PUT /api/v1/programs/:id
exports.updateProgram = async (req, res) => {
  try {
    const { title, description, deadline, milestones } = req.body;
    const nonEmptyMilestones = milestones.filter(m => m.trim() !== "");
    const progress = Math.round((nonEmptyMilestones.length / milestones.length) * 100);

    const updated = await Program.findByIdAndUpdate(
      req.params.id,
      { title, description, deadline, milestones, progress },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Program not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a program
// @route   DELETE /api/v1/programs/:id
exports.deleteProgram = async (req, res) => {
  try {
    const deleted = await Program.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Program not found' });
    res.status(200).json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
