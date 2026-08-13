const { Application, Job, User, Profile, Availability } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const items = await Application.findAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Application.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Application not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { jobId, studentId } = req.body;

    if (!jobId || !studentId) {
      return res.status(400).json({ error: 'Please provide both jobId and studentId.' });
    }

    // 1. Fetch Job details
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // 2. Fetch Student details with Profile
    const student = await User.findByPk(studentId, {
      include: [{ model: Profile, as: 'profile' }]
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // 3. Skills Validation (if job requires any skills)
    if (job.skillsNeeded) {
      const studentSkills = student.profile?.skills
        ? student.profile.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : [];
      const jobSkills = job.skillsNeeded
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const hasMatchingSkill = jobSkills.some(skill => studentSkills.includes(skill));
      if (!hasMatchingSkill) {
        return res.status(400).json({
          error: `Skills Mismatch: You do not possess the required skills for this job (${job.skillsNeeded}). Update your Profile Settings.`
        });
      }
    }

    // 4. Check overlaps with already approved jobs
    if (job.startTime && job.endTime) {
      const startD = new Date(job.startTime);
      const endD = new Date(job.endTime);

      const acceptedApps = await Application.findAll({
        where: {
          studentId: studentId,
          status: 'accepted'
        },
        include: [{ model: Job, as: 'job' }]
      });

      for (const app of acceptedApps) {
        if (app.job) {
          const otherStart = new Date(app.job.startTime);
          const otherEnd = new Date(app.job.endTime);

          // Overlap check: (startD < otherEnd) && (endD > otherStart)
          if (startD < otherEnd && endD > otherStart) {
            return res.status(400).json({
              error: `Schedule Conflict: You already have an approved job '${app.job.title}' scheduled during this time slot (${otherStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${otherEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }).`
            });
          }
        }
      }
    }

    const newItem = await Application.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Application.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedItem = await Application.findByPk(req.params.id);
      res.status(200).json(updatedItem);
    } else {
      res.status(404).json({ error: 'Application not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Application.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const items = await Application.findAll({
      where: { studentId: req.user.id },
      include: [{ model: Job, as: 'job' }]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
