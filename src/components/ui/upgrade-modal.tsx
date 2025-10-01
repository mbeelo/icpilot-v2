'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full shadow-2xl border-2 border-white/20 bg-white/95 backdrop-blur-md">
        <CardHeader className="bg-blue-50 rounded-t-lg">
          <CardTitle className="text-2xl text-gray-900">Upgrade to Pro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white/95">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium mb-2">
              You&apos;ve reached your free limit of 5 outputs this month
            </p>
            <p className="text-blue-800 text-sm">
              Upgrade to Pro for unlimited access to all tools
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Pro includes:</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Unlimited objection rebuttals, messages, and frameworks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Unlimited ICPs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Access to new features as they launch</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              onClick={onUpgrade}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Upgrade to Pro - $49/mo
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}