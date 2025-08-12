'use client'

import Link from 'next/link'
import { useTranscodeJobs } from '@/hooks/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TranscodeJob } from '@/types/api'
import { 
  Clock, 
  Play, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Loader2 
} from 'lucide-react'

export function TranscodeQueueWidget() {
  const { data: jobsResponse, isLoading } = useTranscodeJobs({
    limit: '5', // Only get recent 5 jobs for widget
  })

  // Handle the response structure: jobsResponse has { data: TranscodeJob[], pagination: {...} }
  const jobs = (jobsResponse as any)?.data || []
  const stats = jobs.reduce(
    (acc: Record<string, number>, job: TranscodeJob) => {
      acc[job.status.toLowerCase()] = (acc[job.status.toLowerCase()] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'PROCESSING':
        return <Play className="w-4 h-4 text-blue-600" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      QUEUED: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800', 
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Transcode Queue
          </CardTitle>
          <CardDescription>
            Video transcoding job status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Transcode Queue</CardTitle>
          <CardDescription>
            Recent video transcoding jobs
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/jobs">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-lg font-semibold text-yellow-800">
              {stats.queued || 0}
            </div>
            <div className="text-xs text-yellow-600">Queued</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Play className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold text-blue-800">
              {stats.processing || 0}
            </div>
            <div className="text-xs text-blue-600">Processing</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold text-green-800">
              {stats.completed || 0}
            </div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-lg font-semibold text-red-800">
              {stats.failed || 0}
            </div>
            <div className="text-xs text-red-600">Failed</div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Jobs</h4>
          
          {jobs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No transcode jobs found
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 3).map((job: TranscodeJob) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(job.status)}
                      <span className="text-sm font-medium truncate">
                        {job.video.titleVi || job.video.titleEn}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Job #{job.jobId} • {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {job.status === 'PROCESSING' && (
                      <div className="text-xs text-blue-600">
                        {job.progress}%
                      </div>
                    )}
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              ))}
              
              {jobs.length > 3 && (
                <div className="text-center pt-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/jobs">
                      View {jobs.length - 3} more jobs
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
