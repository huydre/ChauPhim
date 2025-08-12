'use client'

import { useState } from 'react'
import { useTranscodeJobs } from '@/hooks/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, Clock, CheckCircle, XCircle, Play } from 'lucide-react'
import type { TranscodeJob } from '@/types/api'
import React from 'react'

type TranscodeJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

const statusIcons: Record<TranscodeJobStatus, React.ReactElement> = {
  QUEUED: <Clock className="w-4 h-4" />,
  PROCESSING: <Play className="w-4 h-4" />,
  COMPLETED: <CheckCircle className="w-4 h-4" />,
  FAILED: <XCircle className="w-4 h-4" />,
}

const statusColors: Record<TranscodeJobStatus, string> = {
  QUEUED: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: jobsData, isLoading, refetch } = useTranscodeJobs({
    page: page.toString(),
    limit: limit.toString(),
    status: activeTab === 'all' ? undefined : activeTab.toUpperCase(),
  })


  const jobs = (jobsData as any) || []
  const pagination = (jobsData as any)?.pagination

  // Debug logging
  console.log('Debug - jobsData:', jobsData)
  console.log('Debug - jobs:', jobs)
  console.log('Debug - isLoading:', isLoading)

  const formatDuration = (startedAt?: string | null, completedAt?: string | null) => {
    if (!startedAt) return 'N/A'
    if (!completedAt) return 'Processing...'
    
    const start = new Date(startedAt)
    const end = new Date(completedAt)
    const diff = Math.round((end.getTime() - start.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
  }

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transcode Jobs</h1>
          <p className="text-muted-foreground">
            Monitor video transcoding job status and progress
          </p>
        </div>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="queued">Queued</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No transcode jobs found for this status.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {jobs.map((job: TranscodeJob) => (
                  <Card key={job.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {job.video.titleVi || job.video.titleEn || `Video ID: ${job.videoId}`}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Job ID: {job.id}</span>
                            <span>•</span>
                            <span>
                              Created: {new Date(job.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Badge className={statusColors[job.status as TranscodeJobStatus]}>
                          <div className="flex items-center gap-1">
                            {statusIcons[job.status as TranscodeJobStatus]}
                            {job.status}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {job.status === 'PROCESSING' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(job.progress)}%</span>
                          </div>
                          <ProgressBar progress={job.progress} />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Started At
                          </div>
                          <div>
                            {job.startedAt
                              ? new Date(job.startedAt).toLocaleString()
                              : 'Not started'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Duration
                          </div>
                          <div>
                            {formatDuration(job.startedAt, job.completedAt)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Output
                          </div>
                          <div>
                            {job.outputPath ? (
                              <Badge variant="outline">HLS Path Ready</Badge>
                            ) : (
                              'Pending'
                            )}
                          </div>
                        </div>
                      </div>

                      {job.errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="font-medium text-red-800 text-sm">
                            Error Message
                          </div>
                          <div className="text-red-700 text-sm mt-1">
                            {job.errorMessage}
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Input File:</span>{' '}
                            {job.inputPath}
                          </div>
                          <div>
                            <span className="font-medium">Output Path:</span>{' '}
                            {job.outputPath}
                          </div>
                          <div>
                            <span className="font-medium">Qualities:</span>{' '}
                            <div className="flex gap-1 mt-1">
                              {job.qualities.map((quality) => (
                                <Badge key={quality} variant="secondary" className="text-xs">
                                  {quality}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Video Slug:</span>{' '}
                            {job.video.slug}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={page === i + 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
