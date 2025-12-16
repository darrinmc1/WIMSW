import { Progress } from "@/components/ui/progress"

interface PasswordStrengthMeterProps {
    password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    const calculateStrength = (pass: string) => {
        let strength = 0
        if (pass.length === 0) return 0

        // Length check
        if (pass.length >= 8) strength += 25

        // Character variety checks
        if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength += 25
        if (pass.match(/\d/)) strength += 25
        if (pass.match(/[^a-zA-Z\d]/)) strength += 25

        return Math.min(100, strength)
    }

    const strength = calculateStrength(password)

    const getColor = (score: number) => {
        if (score === 0) return "bg-gray-200"
        if (score <= 25) return "bg-red-500" // Weak
        if (score <= 50) return "bg-orange-500" // Fair
        if (score <= 75) return "bg-yellow-500" // Good
        return "bg-green-500" // Strong
    }

    const getLabel = (score: number) => {
        if (score === 0) return ""
        if (score <= 25) return "Weak"
        if (score <= 50) return "Fair"
        if (score <= 75) return "Good"
        return "Strong"
    }

    if (password.length === 0) return null

    return (
        <div className="space-y-2 mt-2">
            <div className="flex justify-between text-xs transition-colors">
                <span className="text-gray-500">Password Strength</span>
                <span className={`font-medium ${strength <= 25 ? "text-red-500" :
                        strength <= 50 ? "text-orange-500" :
                            strength <= 75 ? "text-yellow-600" :
                                "text-green-600"
                    }`}>
                    {getLabel(strength)}
                </span>
            </div>
            {/* Custom progress bar with color transition */}
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ease-out ${getColor(strength)}`}
                    style={{ width: `${strength}%` }}
                />
            </div>
            <ul className="text-xs text-gray-400 list-disc pl-4 space-y-0.5 mt-2">
                <li className={password.length >= 8 ? "text-green-600" : ""}>At least 8 characters</li>
                <li className={password.match(/\d/) ? "text-green-600" : ""}>Contains a number</li>
                <li className={password.match(/[A-Z]/) ? "text-green-600" : ""}>Contains visual variety (uppercase/symbols)</li>
            </ul>
        </div>
    )
}
