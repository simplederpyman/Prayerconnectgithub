import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export function QRCodeDisplay({ url, size = 160 }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-xs text-gray-500 text-center max-w-[200px] break-all">{url}</p>
    </div>
  )
}
