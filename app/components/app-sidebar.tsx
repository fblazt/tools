import * as React from "react"
import { useLocation, Link } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import { ThemeToggle } from "~/components/theme-toggle"

// Tools data
const data = {
  navMain: [
    {
      title: "Encoding Tools",
      url: "#",
      items: [
        {
          title: "QR Code Generator",
          url: "/tools/qr-generator",
        },
      ],
    },
    {
      title: "Security Tools",
      url: "#",
      items: [
        {
          title: "JWT Decoder",
          url: "/tools/jwt-decoder",
        },
      ],
    },
    {
      title: "Design Tools",
      url: "#",
      items: [
        {
          title: "Image to WebP Converter",
          url: "/tools/image-to-webp",
        },
      ],
    },
    {
      title: "Text Tools",
      url: "#",
      items: [
        {
          title: "Markdown Previewer",
          url: "/tools/markdown-previewer",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">fblazt-tools</h2>
              <p className="text-sm text-muted-foreground">Client-Side Tools</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link to={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
