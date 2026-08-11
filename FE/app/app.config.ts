export default defineAppConfig({
  ui: {
    // ══════════════════════════════════════════════
    // 🎨 Brand Colors
    // ══════════════════════════════════════════════
    colors: {
      primary: 'terracotta',
      secondary: 'sky',
      success: 'emerald',
      info: 'blue',
      warning: 'amber',
      error: 'red',
      neutral: 'slate'
    },

    // ══════════════════════════════════════════════
    // 🔣 Default Icons
    // ══════════════════════════════════════════════
    icons: {
      loading: 'i-lucide-loader-circle',
      close: 'i-lucide-x',
      check: 'i-lucide-check',
      chevronDown: 'i-lucide-chevron-down',
      chevronRight: 'i-lucide-chevron-right',
      arrowLeft: 'i-lucide-arrow-left',
      arrowRight: 'i-lucide-arrow-right'
    },

    // ══════════════════════════════════════════════
    // 🧱 Component Default Variants
    // Đảm bảo tất cả dev dùng cùng size/variant
    // ══════════════════════════════════════════════
    button: {
      defaultVariants: {
        size: 'lg',
        color: 'primary',
        variant: 'solid'
      },
      slots: {
        base: '!shadow-sm active:!scale-[0.98] !transition-all !duration-200 focus-visible:!ring-2 focus-visible:!ring-offset-2 focus-visible:!ring-offset-surface font-medium'
      }
    },
    input: {
      defaultVariants: {
        size: 'lg'
      },
      slots: {
        root: 'w-full',
        base: '!w-full !rounded-lg !border !border-solid !border-surface-border !bg-surface !px-3.5 !py-2.5 !text-[14px] !text-surface-foreground !shadow-none focus:!outline-none focus:!border-primary-400 focus:!ring-4 focus:!ring-primary-500/10 !transition-all'
      }
    },
    select: {
      defaultVariants: {
        size: 'lg'
      },
      slots: {
        root: 'w-full',
        base: '!w-full !rounded-lg !border !border-solid !border-surface-border !bg-surface !px-3.5 !py-2.5 !text-[14px] !text-surface-foreground !shadow-none focus:!outline-none focus:!border-primary-400 focus:!ring-4 focus:!ring-primary-500/10 !transition-all'
      }
    },
    selectMenu: {
      defaultVariants: {
        size: 'lg'
      }
    },
    textarea: {
      defaultVariants: {
        size: 'lg'
      },
      slots: {
        root: 'w-full',
        base: '!w-full !rounded-lg !border !border-solid !border-surface-border !bg-surface !px-3.5 !py-2.5 !text-[14px] !text-surface-foreground !shadow-none focus:!outline-none focus:!border-primary-400 focus:!ring-4 focus:!ring-primary-500/10 !transition-all'
      }
    },
    formField: {
      slots: {
        root: 'mb-4',
        label: 'block text-[13px] font-medium text-surface-foreground mb-1.5'
      }
    },
    badge: {
      defaultVariants: {
        size: 'md',
        variant: 'subtle'
      }
    },
    card: {
      slots: {
        root: 'ring-0 shadow-sm'
      }
    },
    navigationMenu: {
      slots: {
        list: 'isolate min-w-0 space-y-2.5', // Khoảng cách các menu thưa hơn
        link: 'group relative w-full flex items-center gap-3.5 font-medium text-[15px] px-4 py-3.5 rounded-lg transition-all duration-200 focus:outline-none',
        linkLeadingIcon: 'shrink-0 size-5 transition-colors',
        childList: 'isolate space-y-1.5 mt-2 pl-4 ml-4',
        childLink:
          'group relative size-full flex items-center gap-3 text-start text-[14px] px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none',
        childLinkIcon: 'size-4 shrink-0 transition-colors',
        separator: 'my-5 h-px bg-white/[0.08] mx-2'
      },
      variants: {
        active: {
          true: {
            link: '!bg-[#ea580c] !text-white before:hidden',
            linkLeadingIcon: '!text-white',
            childLink: '!bg-[#ea580c]/10 !text-[#ea580c] font-semibold before:hidden',
            childLinkIcon: '!text-[#ea580c]'
          },
          false: {
            link: '!text-slate-300 hover:!text-white hover:!bg-white/[0.08] before:hidden',
            linkLeadingIcon: '!text-slate-400 group-hover:!text-white',
            childLink: '!text-slate-400 hover:!text-white hover:!bg-white/[0.08] before:hidden',
            childLinkIcon: '!text-slate-500 group-hover:!text-white'
          }
        }
      }
    }
  }
})
