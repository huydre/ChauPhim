'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Server, 
  Mail, 
  Shield, 
  Palette, 
  Database,
  Video,
  Users,
  Upload,
  Zap,
  Bell,
  Globe,
  Lock,
  Eye,
  Save,
  RotateCcw
} from 'lucide-react'

interface SystemSetting {
  key: string
  value: string | boolean | number
  type: 'text' | 'number' | 'boolean' | 'textarea' | 'select'
  category: string
  label: string
  description?: string
  options?: { label: string; value: string }[]
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([
    // General Settings
    {
      key: 'site_name',
      value: 'ChauPhim',
      type: 'text',
      category: 'general',
      label: 'Tên trang web',
      description: 'Tên hiển thị của trang web'
    },
    {
      key: 'site_description',
      value: 'Nền tảng xem phim trực tuyến hàng đầu',
      type: 'textarea',
      category: 'general',
      label: 'Mô tả trang web',
      description: 'Mô tả ngắn về trang web'
    },
    {
      key: 'site_logo',
      value: '/logo.png',
      type: 'text',
      category: 'general',
      label: 'Logo trang web',
      description: 'Đường dẫn đến file logo'
    },
    {
      key: 'maintenance_mode',
      value: false,
      type: 'boolean',
      category: 'general',
      label: 'Chế độ bảo trì',
      description: 'Bật/tắt chế độ bảo trì'
    },
    {
      key: 'registration_enabled',
      value: true,
      type: 'boolean',
      category: 'general',
      label: 'Cho phép đăng ký',
      description: 'Cho phép người dùng mới đăng ký'
    },

    // Video Settings
    {
      key: 'max_video_size',
      value: 5368709120, // 5GB
      type: 'number',
      category: 'video',
      label: 'Kích thước video tối đa (bytes)',
      description: 'Kích thước file video tối đa cho phép upload'
    },
    {
      key: 'supported_video_formats',
      value: 'mp4,webm,avi,mkv',
      type: 'text',
      category: 'video',
      label: 'Định dạng video hỗ trợ',
      description: 'Các định dạng video được phép upload'
    },
    {
      key: 'video_quality_levels',
      value: '360p,480p,720p,1080p,4K',
      type: 'text',
      category: 'video',
      label: 'Chất lượng video',
      description: 'Các mức chất lượng video hỗ trợ'
    },
    {
      key: 'auto_generate_thumbnails',
      value: true,
      type: 'boolean',
      category: 'video',
      label: 'Tự động tạo thumbnail',
      description: 'Tự động tạo ảnh thumbnail cho video'
    },

    // Email Settings
    {
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      type: 'text',
      category: 'email',
      label: 'SMTP Host',
      description: 'Máy chủ SMTP để gửi email'
    },
    {
      key: 'smtp_port',
      value: 587,
      type: 'number',
      category: 'email',
      label: 'SMTP Port',
      description: 'Cổng SMTP'
    },
    {
      key: 'smtp_username',
      value: 'admin@chauphim.com',
      type: 'text',
      category: 'email',
      label: 'SMTP Username',
      description: 'Tên đăng nhập SMTP'
    },
    {
      key: 'email_notifications',
      value: true,
      type: 'boolean',
      category: 'email',
      label: 'Thông báo email',
      description: 'Gửi thông báo qua email'
    },

    // Security Settings
    {
      key: 'jwt_expires_in',
      value: '7d',
      type: 'text',
      category: 'security',
      label: 'Thời hạn JWT',
      description: 'Thời gian hết hạn của JWT token'
    },
    {
      key: 'max_login_attempts',
      value: 5,
      type: 'number',
      category: 'security',
      label: 'Số lần đăng nhập tối đa',
      description: 'Số lần đăng nhập sai tối đa trước khi khóa'
    },
    {
      key: 'lockout_duration',
      value: 15,
      type: 'number',
      category: 'security',
      label: 'Thời gian khóa (phút)',
      description: 'Thời gian khóa tài khoản sau khi đăng nhập sai'
    },
    {
      key: 'password_min_length',
      value: 8,
      type: 'number',
      category: 'security',
      label: 'Độ dài mật khẩu tối thiểu',
      description: 'Số ký tự tối thiểu của mật khẩu'
    },

    // Storage Settings
    {
      key: 'storage_provider',
      value: 'local',
      type: 'select',
      category: 'storage',
      label: 'Nhà cung cấp lưu trữ',
      description: 'Nhà cung cấp dịch vụ lưu trữ file',
      options: [
        { label: 'Local Storage', value: 'local' },
        { label: 'Amazon S3', value: 's3' },
        { label: 'Google Cloud', value: 'gcs' },
        { label: 'Cloudinary', value: 'cloudinary' }
      ]
    },
    {
      key: 'max_storage_size',
      value: 107374182400, // 100GB
      type: 'number',
      category: 'storage',
      label: 'Dung lượng lưu trữ tối đa (bytes)',
      description: 'Dung lượng lưu trữ tối đa'
    },

    // Performance Settings
    {
      key: 'enable_caching',
      value: true,
      type: 'boolean',
      category: 'performance',
      label: 'Bật cache',
      description: 'Bật/tắt hệ thống cache'
    },
    {
      key: 'cache_ttl',
      value: 3600,
      type: 'number',
      category: 'performance',
      label: 'Thời gian cache (giây)',
      description: 'Thời gian sống của cache'
    },
    {
      key: 'enable_compression',
      value: true,
      type: 'boolean',
      category: 'performance',
      label: 'Nén dữ liệu',
      description: 'Bật/tắt nén dữ liệu response'
    }
  ])

  const updateSetting = (key: string, value: string | boolean | number) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ))
  }

  const resetSettings = () => {
    // Reset to default values - in real app would call API
    console.log('Resetting settings to default values')
  }

  const saveSettings = () => {
    // Save settings - in real app would call API
    console.log('Saving settings:', settings)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderSettingField = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={setting.key}
              checked={setting.value as boolean}
              onCheckedChange={(checked: boolean) => updateSetting(setting.key, checked)}
            />
            <Label htmlFor={setting.key}>{setting.label}</Label>
          </div>
        )
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <Textarea
              id={setting.key}
              value={setting.value as string}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              placeholder={setting.description}
            />
          </div>
        )
      
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <select
              id={setting.key}
              value={setting.value as string}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {setting.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <Input
              id={setting.key}
              type="number"
              value={setting.value as number}
              onChange={(e) => updateSetting(setting.key, parseInt(e.target.value))}
            />
            {setting.key.includes('size') && (
              <p className="text-xs text-muted-foreground">
                {formatBytes(setting.value as number)}
              </p>
            )}
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <Input
              id={setting.key}
              value={setting.value as string}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              placeholder={setting.description}
            />
          </div>
        )
    }
  }

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground">
            Quản lý cấu hình và tùy chỉnh hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Đặt lại
          </Button>
          <Button onClick={saveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Lưu trữ
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Hiệu năng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt chung
              </CardTitle>
              <CardDescription>
                Cấu hình cơ bản của trang web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('general').map((setting) => (
                <div key={setting.key}>
                  {renderSettingField(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Cài đặt video
              </CardTitle>
              <CardDescription>
                Cấu hình xử lý và lưu trữ video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('video').map((setting) => (
                <div key={setting.key}>
                  {renderSettingField(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Cài đặt email
              </CardTitle>
              <CardDescription>
                Cấu hình dịch vụ gửi email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('email').map((setting) => (
                <div key={setting.key}>
                  {renderSettingField(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cài đặt bảo mật
              </CardTitle>
              <CardDescription>
                Cấu hình bảo mật và xác thực
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('security').map((setting) => (
                <div key={setting.key}>
                  {renderSettingField(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cài đặt lưu trữ
              </CardTitle>
              <CardDescription>
                Cấu hình dịch vụ lưu trữ file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('storage').map((setting) => (
                <div key={setting.key}>
                  {renderSettingField(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Cài đặt hiệu năng
              </CardTitle>
              <CardDescription>
                Cấu hình tối ưu hóa hiệu năng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('performance').map((setting) => (
                <div key={setting.key}>
                  {renderSettingField(setting)}
                  {setting.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
