import mongoose from 'mongoose'

export interface ILoginLog extends mongoose.Document {
  adminId: mongoose.Types.ObjectId
  username: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason?: string
  loginTime: Date
}

const LoginLogSchema = new mongoose.Schema<ILoginLog>({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: function() { return this.success }
  },
  username: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  failureReason: {
    type: String,
    required: function() { return !this.success }
  },
  loginTime: {
    type: Date,
    default: Date.now
  }
})

// Index untuk performance
LoginLogSchema.index({ adminId: 1, loginTime: -1 })
LoginLogSchema.index({ username: 1, loginTime: -1 })

export default mongoose.models.LoginLog || mongoose.model<ILoginLog>('LoginLog', LoginLogSchema)