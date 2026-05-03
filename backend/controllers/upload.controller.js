import * as fileService from '../services/file.service.js';
import * as taskService from '../services/task.service.js';
import Task from '../models/task.model.js';
import Project from '../models/project.model.js';

/**
 * @desc    Upload file and attach to task
 * @route   POST /api/upload/task/:taskId
 * @access  Private
 */
export const uploadTaskAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { taskId } = req.params;

    // Validate file type
    try {
      fileService.validateFileType(req.file, 'all');
    } catch (error) {
      // Delete uploaded file if validation fails
      await fileService.deleteFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Get file info
    const fileInfo = fileService.getFileInfo(req.file, req.protocol + '://' + req.get('host'));

    // Add attachment to task
    const task = await taskService.addAttachment(
      taskId,
      fileInfo,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'File uploaded and attached to task successfully',
      data: {
        file: fileInfo,
        task,
      },
    });
  } catch (error) {
    console.error('Upload task attachment error:', error);

    // Clean up uploaded file on error
    if (req.file) {
      await fileService.deleteFile(req.file.filename);
    }

    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error uploading file',
    });
  }
};

/**
 * @desc    Upload multiple files and attach to task
 * @route   POST /api/upload/task/:taskId/multiple
 * @access  Private
 */
export const uploadMultipleTaskAttachments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const { taskId } = req.params;
    const uploadedFiles = [];
    const failedFiles = [];

    // Validate all files first
    for (const file of req.files) {
      try {
        fileService.validateFileType(file, 'all');
        uploadedFiles.push(file);
      } catch (error) {
        failedFiles.push({
          filename: file.originalname,
          error: error.message,
        });
        await fileService.deleteFile(file.filename);
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All files failed validation',
        errors: failedFiles,
      });
    }

    // Get task and verify access
    const task = await Task.findById(taskId);
    if (!task) {
      // Clean up all uploaded files
      await fileService.deleteFiles(uploadedFiles.map(f => f.filename));
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    const hasAccess = 
      project.createdBy.toString() === req.user.id.toString() ||
      project.isMember(req.user.id);

    if (!hasAccess) {
      await fileService.deleteFiles(uploadedFiles.map(f => f.filename));
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task',
      });
    }

    // Add all attachments
    const attachments = [];
    for (const file of uploadedFiles) {
      const fileInfo = fileService.getFileInfo(file, req.protocol + '://' + req.get('host'));
      task.attachments.push({
        ...fileInfo,
        uploadedBy: req.user.id,
      });
      attachments.push(fileInfo);
    }

    await task.save();
    await task.populate('attachments.uploadedBy', 'name email avatar');

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        attachments,
        task,
        failed: failedFiles.length > 0 ? failedFiles : undefined,
      },
    });
  } catch (error) {
    console.error('Upload multiple attachments error:', error);

    // Clean up all uploaded files on error
    if (req.files) {
      await fileService.deleteFiles(req.files.map(f => f.filename));
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading files',
    });
  }
};

/**
 * @desc    Upload avatar image
 * @route   POST /api/upload/avatar
 * @access  Private
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Validate file type (images only)
    try {
      fileService.validateFileType(req.file, 'images');
    } catch (error) {
      await fileService.deleteFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const fileInfo = fileService.getFileInfo(req.file, req.protocol + '://' + req.get('host'));

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        file: fileInfo,
      },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);

    if (req.file) {
      await fileService.deleteFile(req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading avatar',
    });
  }
};

/**
 * @desc    Delete file
 * @route   DELETE /api/upload/:filename
 * @access  Private
 */
export const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;

    // Check if file exists
    const exists = await fileService.fileExists(filename);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete file
    const deleted = await fileService.deleteFile(filename);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error deleting file',
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting file',
    });
  }
};

/**
 * @desc    Get upload statistics
 * @route   GET /api/upload/stats
 * @access  Private (Admin only)
 */
export const getUploadStats = async (req, res) => {
  try {
    const stats = await fileService.getUploadStats();

    if (!stats) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching upload statistics',
      });
    }

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching statistics',
    });
  }
};

/**
 * @desc    Clean old files
 * @route   POST /api/upload/clean
 * @access  Private (Admin only)
 */
export const cleanOldFiles = async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;

    const result = await fileService.cleanOldFiles(daysOld);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Cleaned ${result.deletedCount} old file(s)`,
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Error cleaning old files',
      });
    }
  } catch (error) {
    console.error('Clean old files error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cleaning files',
    });
  }
};

export default {
  uploadTaskAttachment,
  uploadMultipleTaskAttachments,
  uploadAvatar,
  deleteFile,
  getUploadStats,
  cleanOldFiles,
};

// Made with Bob
