export default defineAppConfig({
  ui: {
    // ══════════════════════════════════════════════
    // 🎨 Brand Colors
    // ══════════════════════════════════════════════
    colors: {
      primary: 'emerald', // Xanh lá — gợi nhớ thực phẩm sạch / bún tươi
      secondary: 'sky',
      success: 'green',
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
        size: 'md',
        color: 'primary',
        variant: 'solid'
      }
    },
    input: {
      defaultVariants: {
        size: 'md'
      }
    },
    select: {
      defaultVariants: {
        size: 'md'
      }
    },
    selectMenu: {
      defaultVariants: {
        size: 'md'
      }
    },
    textarea: {
      defaultVariants: {
        size: 'md'
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
