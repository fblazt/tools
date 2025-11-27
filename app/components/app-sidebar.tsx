import * as React from "react"

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

// Tools data
const data = {
  navMain: [
    {
      title: "Data Tools",
      url: "#",
      items: [
        {
          title: "JSON Formatter",
          url: "/tools/json-formatter",
        },
      ],
    },
    {
      title: "Encoding Tools",
      url: "#",
      items: [
        {
          title: "Base64 Encoder",
          url: "/tools/base64-encoder",
        },
        {
          title: "QR Code Generator",
          url: "/tools/qr-generator",
          isActive: true,
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
        {
          title: "Hash Generator",
          url: "/tools/hash-generator",
        },
      ],
    },
    {
      title: "Design Tools",
      url: "#",
      items: [
        {
          title: "Color Picker",
          url: "/tools/color-picker",
        },
      ],
    },
    {
      title: "Text Tools",
      url: "#",
      items: [
        {
          title: "Text Diff",
          url: "/tools/text-diff",
        },
      ],
    },
    {
      title: "Web Tools",
      url: "#",
      items: [
        {
          title: "URL Parser",
          url: "/tools/url-parser",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold">fblazt-tools</h2>
          <p className="text-sm text-muted-foreground">Client-Side Tools</p>
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
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
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
