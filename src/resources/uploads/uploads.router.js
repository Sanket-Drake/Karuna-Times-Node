import { Router } from 'express'
import { uploadAttachment } from './uploads.controllers'
import { isAuthenticated } from '../../utils/auth'
import { imageFilter } from '../../utils/helper'
import compose from 'composable-middleware'

const router = Router()
const multer = require('multer')
const storage = multer.memoryStorage()

export function imageUploadValidation() {
  return (
    compose()
      // Validate jwt
      .use(function(req, res, next) {
        const upload = multer({
          storage: storage,
          limits: {
            fileSize: 20 * 1024 * 1024
          }
        }).single('attachment')
        upload(req, res, function(error) {
          // instanceof multer.MulterError
          if (error) {
            let message = error
            if (error.code == 'LIMIT_FILE_SIZE') {
              message = 'File Size is too large. Allowed file size is 2MB'
            }
            return res.status(500).json({ data: false, message, status: false })
          } else {
            if (!req.file) {
              return res.status(500).json({
                data: false,
                message: 'File not found',
                status: false
              })
            }
            // callback on succcess
            next()
          }
        })
      })
  )
}

router.post('/pending-upload/:attachmentname', [isAuthenticated(), imageUploadValidation()], uploadAttachment)

export default router
