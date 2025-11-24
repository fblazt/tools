import * as React from "react"

import { SearchForm } from "~/components/search-form"
import { VersionSwitcher } from "~/components/version-switcher"
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
  versions: ["1.0.0"],
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
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
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
