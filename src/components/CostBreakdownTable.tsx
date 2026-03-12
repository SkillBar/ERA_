"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CostBreakdownRow } from "@/types/project"
import { cn } from "@/lib/utils"

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value)
}

export interface CostBreakdownTableProps {
  rows: CostBreakdownRow[]
  className?: string
}

/**
 * Таблица детальной сметы: секции (заголовки), позиции (цена × кол-во = итог), промежуточные и общий итоги.
 * Стилизация под таблицу из макета: тёмные заголовки секций и строки итогов.
 */
export function CostBreakdownTable({ rows, className }: CostBreakdownTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/80 hover:bg-muted/80">
            <TableHead className="font-semibold text-foreground">Наименование</TableHead>
            <TableHead className="w-[120px] text-right font-semibold text-foreground">Цена</TableHead>
            <TableHead className="w-[80px] text-right font-semibold text-foreground">Кол-во</TableHead>
            <TableHead className="w-[120px] text-right font-semibold text-foreground">Итог</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            if (row.kind === "section") {
              return (
                <TableRow
                  key={`section-${index}`}
                  className="border-border bg-muted font-medium text-foreground dark:bg-muted/90"
                >
                  <TableCell colSpan={4} className="py-2.5">
                    {row.title}
                  </TableCell>
                </TableRow>
              )
            }
            if (row.kind === "item") {
              return (
                <TableRow key={`item-${index}`}>
                  <TableCell className="text-muted-foreground">{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(row.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.qty}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatNumber(row.total)}</TableCell>
                </TableRow>
              )
            }
            if (row.kind === "itemGroup") {
              return (
                <TableRow key={`group-${index}`}>
                  <TableCell className="align-top text-muted-foreground">
                    <ul className="list-inside list-disc space-y-0.5 text-sm">
                      {row.labels.map((label, i) => (
                        <li key={i}>{label}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(row.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.qty}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatNumber(row.total)}</TableCell>
                </TableRow>
              )
            }
            if (row.kind === "subtotal") {
              return (
                <TableRow
                  key={`subtotal-${index}`}
                  className="border-border bg-muted/70 font-medium dark:bg-muted/80"
                >
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(row.value)}</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              )
            }
            if (row.kind === "calc") {
              return (
                <TableRow key={`calc-${index}`}>
                  <TableCell className="text-muted-foreground">{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(row.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.qty}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatNumber(row.total)}</TableCell>
                </TableRow>
              )
            }
            if (row.kind === "total") {
              return (
                <TableRow
                  key={`total-${index}`}
                  className="border-border bg-muted font-semibold text-foreground dark:bg-muted/90"
                >
                  <TableCell className="py-3">{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums py-3">{formatNumber(row.value)}</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              )
            }
            return null
          })}
        </TableBody>
      </Table>
    </div>
  )
}
