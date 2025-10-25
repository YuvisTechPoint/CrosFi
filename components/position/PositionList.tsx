"use client"

import { LendingPosition } from "@/lib/types"
import { PositionCard } from "./PositionCard"
import { PositionSummary } from "./PositionSummary"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface PositionListProps {
  positions: LendingPosition[]
  onRepay?: (position: LendingPosition) => void
  onAddCollateral?: (position: LendingPosition) => void
  onClose?: (position: LendingPosition) => void
  onDetails?: (position: LendingPosition) => void
  onCreateNew?: () => void
  className?: string
}

export function PositionList({
  positions,
  onRepay,
  onAddCollateral,
  onClose,
  onDetails,
  onCreateNew,
  className = ''
}: PositionListProps) {
  const activePositions = positions.filter(p => p.status === 'active')
  const closedPositions = positions.filter(p => p.status === 'closed')
  const liquidatedPositions = positions.filter(p => p.status === 'liquidated')

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary */}
      <PositionSummary positions={positions} />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Your Positions ({activePositions.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {onCreateNew && (
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Position
            </Button>
          )}
        </div>
      </div>

      {/* Active Positions */}
      {activePositions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activePositions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              onRepay={() => onRepay?.(position)}
              onAddCollateral={() => onAddCollateral?.(position)}
              onClose={() => onClose?.(position)}
              onDetails={() => onDetails?.(position)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-lg font-medium mb-2">No Active Positions</h3>
            <p className="text-sm">
              You don't have any active lending positions yet. Create your first position to start earning.
            </p>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Position
            </Button>
          )}
        </Card>
      )}

      {/* Closed Positions */}
      {closedPositions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Closed Positions ({closedPositions.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {closedPositions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onDetails={() => onDetails?.(position)}
                className="opacity-75"
              />
            ))}
          </div>
        </div>
      )}

      {/* Liquidated Positions */}
      {liquidatedPositions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Liquidated Positions ({liquidatedPositions.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liquidatedPositions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onDetails={() => onDetails?.(position)}
                className="opacity-75 border-red-200 bg-red-50"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
