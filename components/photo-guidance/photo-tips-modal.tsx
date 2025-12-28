"use client"

import { useState } from "react"
import { X, Camera, Sun, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PhotoTipsModalProps {
  open: boolean
  onClose: () => void
  onDontShowAgain?: () => void
}

export function PhotoTipsModal({ open, onClose, onDontShowAgain }: PhotoTipsModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain && onDontShowAgain) {
      // Save to localStorage
      localStorage.setItem('photoTipsShown', 'true')
      onDontShowAgain()
    }
    onClose()
  }

  const tips = [
    {
      icon: Sun,
      iconColor: "text-yellow-500",
      title: "Natural Light is King",
      description: "Take photos near a window during daytime. Avoid flash - it creates harsh glares on labels.",
      good: "✓ Daylight near window",
      bad: "✗ Flash or dark room"
    },
    {
      icon: ImageIcon,
      iconColor: "text-blue-500",
      title: "Use Plain Backgrounds",
      description: "Place items on white/light grey surfaces (bedsheet or clean wall). Avoid cluttered backgrounds.",
      good: "✓ Plain white surface",
      bad: "✗ Patterned or messy"
    },
    {
      icon: Camera,
      iconColor: "text-purple-500",
      title: "The Rule of 4 Photos",
      description: "Include: (1) Full item front view, (2) Brand label closeup, (3) Size/care tag, (4) Any flaws",
      good: "✓ Multiple angles",
      bad: "✗ Just one photo"
    },
    {
      icon: AlertCircle,
      iconColor: "text-orange-500",
      title: "Show Flaws Honestly",
      description: "Close-ups of stains, pills, or damage build trust. Buyers appreciate transparency.",
      good: "✓ Document defects",
      bad: "✗ Hide issues"
    }
  ]

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-600" />
            Pro Photo Tips for Better AI Results
          </DialogTitle>
          <DialogDescription className="text-base">
            High-quality photos = More accurate pricing & faster sales
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-400 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm ${tip.iconColor}`}>
                  <tip.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{tip.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{tip.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tip.good}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <X className="w-3 h-3" />
                      <span>{tip.bad}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Examples */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Quick Checklist Before Upload
          </h4>
          <ul className="text-sm space-y-1 ml-6">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>All labels are clear and in focus</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Photo isn't blurry or too dark</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Background is clean and neutral</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Any damage is visible if present</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-muted-foreground">Don't show this again</span>
          </label>

          <Button onClick={handleClose} className="bg-purple-600 hover:bg-purple-700">
            Got it! Let's upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
