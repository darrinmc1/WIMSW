"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Info, Lightbulb, Camera } from "lucide-react"

interface PhotoQualityFeedback {
  score: number // 0-100
  issues: {
    type: 'error' | 'warning' | 'success'
    message: string
    suggestion: string
  }[]
  overall: string
}

interface PhotoQualityAnalyzerProps {
  imageBase64: string
  onRetake?: () => void
}

export function PhotoQualityAnalyzer({ imageBase64, onRetake }: PhotoQualityAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<PhotoQualityFeedback | null>(null)

  const analyzePhoto = async () => {
    setAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze-photo-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageBase64 }),
      })

      const data = await response.json()
      setFeedback(data.feedback)
    } catch (error) {
      console.error('Photo quality analysis failed:', error)
      setFeedback({
        score: 50,
        issues: [{
          type: 'warning',
          message: 'Could not analyze photo quality',
          suggestion: 'Proceed with upload, but ensure good lighting and clarity'
        }],
        overall: 'Unable to analyze - please ensure photo is clear and well-lit'
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="space-y-3">
      {!feedback && (
        <Button
          onClick={analyzePhoto}
          disabled={analyzing}
          variant="outline"
          size="sm"
          className="w-full border-purple-200 hover:border-purple-400 hover:bg-purple-50"
        >
          {analyzing ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
              Analyzing photo quality...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Check Photo Quality
            </>
          )}
        </Button>
      )}

      {feedback && (
        <div className={`rounded-lg border-2 p-4 ${getScoreBg(feedback.score)}`}>
          {/* Score Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {feedback.score >= 80 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : feedback.score >= 60 ? (
                <Info className="h-5 w-5 text-yellow-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold text-sm">Photo Quality Score</span>
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
              {feedback.score}/100
            </span>
          </div>

          {/* Overall Assessment */}
          <p className="text-sm text-gray-700 mb-3 font-medium">
            {feedback.overall}
          </p>

          {/* Issues & Suggestions */}
          {feedback.issues.length > 0 && (
            <div className="space-y-2">
              {feedback.issues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-white/50 rounded p-3 text-sm border border-gray-200"
                >
                  <div className="flex items-start gap-2">
                    {issue.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : issue.type === 'warning' ? (
                      <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{issue.message}</p>
                      <p className="text-gray-600 mt-1 flex items-start gap-1">
                        <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{issue.suggestion}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {feedback.score < 70 && onRetake && (
              <Button
                onClick={onRetake}
                size="sm"
                variant="outline"
                className="flex-1 border-purple-300 hover:bg-purple-50"
              >
                <Camera className="mr-2 h-4 w-4" />
                Retake Photo
              </Button>
            )}
            <Button
              onClick={() => setFeedback(null)}
              size="sm"
              variant="ghost"
              className="flex-1"
            >
              Check Again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
