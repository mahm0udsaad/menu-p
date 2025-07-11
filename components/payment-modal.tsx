'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Phone, Clock, Send } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

interface ContactFormInputs {
  name: string;
  email: string;
  message: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export default function ContactSalesModal({ isOpen, onClose, planName }: ContactModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormInputs>();

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    // Here you would typically send the data to your backend or a service like Formspree
    console.log('Form data submitted:', data);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.');
    onClose();
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+201000000000'; // Replace with your WhatsApp number
    const message = `مرحبًا، أنا مهتم بالخطة (${planName}). هل يمكنني الحصول على مزيد من المعلومات؟`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-2xl" dir="rtl">
        <DialogHeader className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-3xl font-bold text-gray-900">تواصل مع فريق المبيعات</DialogTitle>
          <DialogDescription className="text-lg text-gray-500 mt-2">
            نحن هنا لمساعدتك! اختر الطريقة التي تناسبك للتواصل معنا.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* WhatsApp Contact */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-green-400 transition-all duration-300">
            <Phone className="w-10 h-10 text-green-600 mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">دعم عبر واتساب</h3>
            <p className="text-gray-600 mb-4">تحدث مباشرة مع أحد أعضاء فريقنا للحصول على مساعدة فورية.</p>
            <Button onClick={handleWhatsAppClick} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
              ابدأ المحادثة
            </Button>
          </div>

          {/* Support Hours */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-blue-400 transition-all duration-300">
            <Clock className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">ساعات العمل</h3>
            <p className="text-gray-600 font-semibold text-lg">من 9 صباحًا إلى 9 مساءً</p>
            <p className="text-gray-500">يوميًا</p>
          </div>
        </div>

        <div className="text-center my-4">
          <p className="text-gray-500">أو أرسل لنا رسالة عبر النموذج التالي</p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name" className="font-semibold text-gray-700">الاسم</Label>
            <Input 
              id="name" 
              {...register('name', { required: 'الاسم مطلوب' })} 
              className="mt-2" 
              placeholder="اسمك الكامل"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="font-semibold text-gray-700">البريد الإلكتروني</Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email', { required: 'البريد الإلكتروني مطلوب', pattern: { value: /\S+@\S+\.\S+/, message: 'صيغة البريد الإلكتروني غير صحيحة' } })} 
              className="mt-2" 
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="message" className="font-semibold text-gray-700">رسالتك</Label>
            <Textarea 
              id="message" 
              {...register('message', { required: 'الرسالة مطلوبة' })} 
              className="mt-2" 
              rows={4} 
              placeholder={`أنا مهتم بخطة ${planName} وأود معرفة المزيد...`}
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="ml-2 w-5 h-5" />
                إرسال الرسالة
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
