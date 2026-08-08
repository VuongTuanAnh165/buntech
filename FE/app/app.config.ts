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
    }
  }
})
