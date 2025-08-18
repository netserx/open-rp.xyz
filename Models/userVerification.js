const { Schema, model } = require('mongoose');

const reportSubSchema = new Schema({
  id: { type: String, required: true, index: true }, // معرف فريد للتقرير (مثلاً UUID)
  messageId: { type: String, default: null },
  channelId: { type: String, required: true },
  heartsFrom: { type: [String], default: [] }, // اللي ضغطوا قلب على هذا البلاغ
  createdAt: { type: Date, default: Date.now }
}, { _id: false }); // منع إنشاء _id فرعي تلقائي إذا مش محتاجه

const userVerificationSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  heartsFrom: { type: [String], default: [] }, // لو لسه مستخدم في مكان آخر
  reports: { type: [reportSubSchema], default: [] } // البلاغات المرتبطة بالمستخدم
});

module.exports = model('userVerification', userVerificationSchema);
