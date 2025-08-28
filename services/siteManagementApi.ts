// مكتبة إدارة الموقع للمشاريع الخارجية
// External Site Management API Library

import { createClient } from '@supabase/supabase-js';

// إعدادات الاتصال بـ Supabase
const SUPABASE_URL = "https://ophlmmpisgizpvgxndkh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waGxtbXBpc2dpenB2Z3huZGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTcxMDIsImV4cCI6MjA2NzczMzEwMn0.c489RBMwNt_k5cHLVOJX44Ocn7hMgCA_bZkCFJVLxrM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== المصادقة والمستخدمين ==========
export const Auth = {
  // تسجيل الدخول
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // تسجيل الخروج
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  // الحصول على المستخدم الحالي
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return user;
  },

  // التحقق من صلاحيات الإدارة
  async isAdmin() {
    const { data, error } = await supabase.rpc("is_admin");
    if (error) throw new Error(error.message);
    return data;
  }
};

// ========== إدارة إعدادات الموقع ==========
export const SiteSettings = {
  // الحصول على جميع الإعدادات
  async getAll() {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*");
    if (error) throw new Error(error.message);
    return data;
  },

  // الحصول على إعداد محدد
  async get(key) {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },

  // تحديث أو إنشاء إعداد
  async set(key, value, description = null) {
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({
        key,
        value,
        description,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
    return data;
  },

  // تحديث أيقونة الموقع
  async updateFavicon(favicon_url, favicon_path = null) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "favicon",
        value: { url: favicon_url, path: favicon_path },
        favicon_url,
        favicon_path,
        description: "إعدادات أيقونة الموقع",
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
  }
};

// ========== إدارة المنشورات ==========
export const Posts = {
  // الحصول على جميع المنشورات
  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data;
  },

  // إنشاء منشور جديد
  async create(post) {
    const { error } = await supabase.from("posts").insert([{
      ...post,
      timestamp: post.timestamp || new Date().toISOString(),
      status: post.status || "published",
      is_pinned: post.is_pinned || false,
    }]);
    if (error) throw new Error(error.message);
  },

  // تحديث منشور
  async update(id, patch) {
    const { error } = await supabase
      .from("posts")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // حذف منشور
  async delete(id) {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // تثبيت/إلغاء تثبيت منشور
  async pin(id, pinned = true) {
    await this.update(id, { is_pinned: pinned });
  }
};

// ========== إدارة الرحلات ==========
export const Trips = {
  // الحصول على جميع الرحلات
  async getAll() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  // الحصول على الرحلات القادمة
  async getUpcoming() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .gte("date", new Date().toISOString().split('T')[0])
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  // إنشاء رحلة جديدة
  async create(trip) {
    const { error } = await supabase.from("trips").insert([{
      ...trip,
      available_spots: trip.available_spots || 50,
    }]);
    if (error) throw new Error(error.message);
  },

  // تحديث رحلة
  async update(id, patch) {
    const { error } = await supabase
      .from("trips")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // حذف رحلة
  async delete(id) {
    const { error } = await supabase
      .from("trips")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
};

// ========== إدارة الحجوزات ==========
export const Bookings = {
  // الحصول على جميع الحجوزات
  async getAll(studentId = null) {
    let query = supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (studentId) {
      query = query.eq("student_id", studentId);
    }
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  // إنشاء حجز جديد
  async create(booking) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("يجب تسجيل الدخول أولاً");

    const { error } = await supabase.from("bookings").insert([{
      ...booking,
      student_id: booking.student_id || user.user.id,
      status: booking.status || "قيد المراجعة",
      type: booking.service_type,
    }]);
    if (error) throw new Error(error.message);
  },

  // حجز رحلة
  async bookTrip(tripId, studentName = null) {
    const trip = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();
    
    if (trip.error) throw new Error(trip.error.message);
    
    await this.create({
      service_type: "trip",
      item_id: tripId,
      item_name: trip.data.name,
      item_date: trip.data.date,
      item_time: trip.data.time,
      item_location: trip.data.meeting_point,
      student_name: studentName,
    });
  },

  // حجز درس
  async bookLesson(lessonId, studentName = null) {
    const lesson = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();
    
    if (lesson.error) throw new Error(lesson.error.message);
    
    await this.create({
      service_type: "lesson",
      item_id: lessonId,
      item_name: lesson.data.title,
      item_date: lesson.data.date,
      item_time: lesson.data.time,
      item_location: lesson.data.location,
      student_name: studentName,
    });
  },

  // تحديث حالة الحجز
  async updateStatus(id, status, notes = null) {
    const { error } = await supabase
      .from("bookings")
      .update({ status, notes })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // حذف حجز
  async delete(id) {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
};

// ========== إدارة الاشتراكات ==========
export const Subscriptions = {
  // الحصول على جميع طلبات الاشتراك
  async getAllRequests() {
    const { data, error } = await supabase
      .from("subscription_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  // إنشاء طلب اشتراك جديد
  async createRequest(request) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("يجب تسجيل الدخول أولاً");

    const { error } = await supabase.from("subscription_requests").insert([{
      ...request,
      student_id: request.student_id || user.user.id,
      status: request.status || "قيد المراجعة",
    }]);
    if (error) throw new Error(error.message);
  },

  // الموافقة على طلب اشتراك
  async approveRequest(id, endDate) {
    // تحديث طلب الاشتراك
    const { data: request, error: reqError } = await supabase
      .from("subscription_requests")
      .update({ status: "مقبول" })
      .eq("id", id)
      .select()
      .single();
    
    if (reqError) throw new Error(reqError.message);
    
    // تحديث ملف المستخدم
    if (request?.student_id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ subscription_end_date: endDate })
        .eq("id", request.student_id);
      
      if (profileError) throw new Error(profileError.message);
    }
  },

  // رفض طلب اشتراك
  async rejectRequest(id, reason = null) {
    const { error } = await supabase
      .from("subscription_requests")
      .update({ 
        status: "مرفوض",
        ...(reason && { notes: reason })
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // التحقق من اشتراك المستخدم
  async checkUserSubscription(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_end_date")
      .eq("id", userId)
      .single();
    
    if (error) throw new Error(error.message);
    
    if (!data.subscription_end_date) return { active: false };
    
    const endDate = new Date(data.subscription_end_date);
    const now = new Date();
    
    return {
      active: endDate > now,
      endDate: data.subscription_end_date,
      daysLeft: Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    };
  }
};

// ========== إدارة الإشعارات ==========
export const Notifications = {
  // إرسال إشعار عام
  async broadcast(title, message, link = null) {
    const { error } = await supabase.from("notifications").insert([{
      user_id: null, // null = إشعار عام لجميع المستخدمين
      title,
      message,
      link,
    }]);
    if (error) throw new Error(error.message);
  },

  // إرسال إشعار لمستخدم محدد
  async sendToUser(userId, title, message, link = null) {
    const { error } = await supabase.from("notifications").insert([{
      user_id: userId,
      title,
      message,
      link,
    }]);
    if (error) throw new Error(error.message);
  },

  // الحصول على إشعارات المستخدم الحالي
  async getMine() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("يجب تسجيل الدخول أولاً");

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${user.user.id},user_id.is.null`)
      .order("created_at", { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // تحديد إشعار كمقروء
  async markAsRead(id) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
};

// ========== إدارة المعلمين ==========
export const Teachers = {
  // الحصول على جميع المعلمين
  async getAll() {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  // إنشاء معلم جديد
  async create(teacher) {
    const { error } = await supabase
      .from("teachers")
      .insert([teacher]);
    if (error) throw new Error(error.message);
  },

  // تحديث معلم
  async update(id, patch) {
    const { error } = await supabase
      .from("teachers")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // حذف معلم
  async delete(id) {
    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
};

// تصدير جميع الوحدات
export default {
  Auth,
  SiteSettings,
  Posts,
  Trips,
  Bookings,
  Subscriptions,
  Notifications,
  Teachers,
  // الاتصال المباشر مع Supabase للعمليات المتقدمة
  supabase
};
