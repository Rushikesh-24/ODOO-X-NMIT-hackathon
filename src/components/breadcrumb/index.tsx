'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BreadcrumbSegment {
  label: string
  href: string
}

interface DynamicBreadcrumbProps {
  homeLabel?: string
  maxItems?: number
  capitalizeSegments?: boolean
  customLabels?: Record<string, string>
}

export function DynamicBreadcrumb({
  homeLabel = "Home",
  maxItems = 3,
  capitalizeSegments = true,
  customLabels = {}
}: DynamicBreadcrumbProps) {
  const pathname = usePathname()

  const breadcrumbSegments = useMemo(() => {
    const segments = pathname.split('/').filter(segment => segment !== '')
    
    const breadcrumbs: BreadcrumbSegment[] = []
    
    // Add each segment
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      
      // Use custom label if provided, otherwise format the segment
      let label = customLabels[segment] || customLabels[href]
      
      if (!label) {
        // Replace hyphens and underscores with spaces
        label = segment.replace(/[-_]/g, ' ')
        
        // Capitalize if enabled
        if (capitalizeSegments) {
          label = label.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
      }
      
      breadcrumbs.push({ label, href })
    })
    
    return breadcrumbs
  }, [pathname, capitalizeSegments, customLabels])

  const renderBreadcrumbItems = () => {
    const items = []
    
    // Always show Home
    items.push(
      <BreadcrumbItem key="home">
        <BreadcrumbLink asChild>
          <Link href="/">{homeLabel}</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    )

    if (breadcrumbSegments.length === 0) {
      return items
    }

    // Add separator after home if there are segments
    items.push(<BreadcrumbSeparator key="home-separator" />)

    // If we have more items than maxItems, show dropdown
    if (breadcrumbSegments.length > maxItems) {
      const hiddenItems = breadcrumbSegments.slice(0, -maxItems + 1)
      const visibleItems = breadcrumbSegments.slice(-maxItems + 1)

      // Add dropdown for hidden items
      items.push(
        <BreadcrumbItem key="dropdown">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
              <BreadcrumbEllipsis className="size-4" />
              <span className="sr-only">Show more</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {hiddenItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>,
        <BreadcrumbSeparator key="dropdown-separator" />
      )

      // Add visible items
      visibleItems.forEach((item, index) => {
        const isLast = index === visibleItems.length - 1

        items.push(
          <BreadcrumbItem key={item.href}>
            {isLast ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={item.href}>{item.label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        )

        if (!isLast) {
          items.push(<BreadcrumbSeparator key={`${item.href}-separator`} />)
        }
      })
    } else {
      // Show all items normally
      breadcrumbSegments.forEach((item, index) => {
        const isLast = index === breadcrumbSegments.length - 1

        items.push(
          <BreadcrumbItem key={item.href}>
            {isLast ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={item.href}>{item.label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        )

        if (!isLast) {
          items.push(<BreadcrumbSeparator key={`${item.href}-separator`} />)
        }
      })
    }

    return items
  }

  return (
    <Breadcrumb className="px-8 pt-5">
      <BreadcrumbList>
        {renderBreadcrumbItems()}
      </BreadcrumbList>
    </Breadcrumb>
  )
}