<script setup lang="ts">
import {
  Sparkles,
  Award,
  Users,
  Heart,
  Leaf,
  Truck,
  Target,
  Eye,
  MapPin,
  Phone,
  ChevronRight,
  Factory,
  ShieldCheck
} from 'lucide-vue-next'

useSeoMeta({ title: 'Về chúng tôi - BunTech' })
definePageMeta({ layout: 'default' })

const heroImage =
  'https://images.pexels.com/photos/1001773/pexels-photo-1001773.jpeg?auto=compress&cs=tinysrgb&w=1600'

const stats = [
  { value: '60+ năm', label: 'Kinh nghiệm truyền thống', icon: Award },
  { value: '50+', label: 'Đại lý phục vụ', icon: Users },
  { value: '100%', label: 'Gạo tự nhiên', icon: Leaf },
  { value: '1000+ kg', label: 'Sản xuất mỗi ngày', icon: Factory }
]

const values = [
  {
    icon: Leaf,
    title: 'Nguyên liệu tự nhiên',
    desc: '100% gạo tự nhiên tuyển chọn, không chất bảo quản, không hàn the. An toàn cho sức khỏe gia đình bạn.'
  },
  {
    icon: Heart,
    title: 'Tận tâm phục vụ',
    desc: 'Khách hàng là người thân. Chúng tôi chăm chút từng bọc bún như chính bún nhà mình ăn.'
  },
  {
    icon: Truck,
    title: 'Giao hàng nhanh chóng',
    desc: 'Nội thành 2 giờ, ngoại thành 4 giờ. Bún tươi nóng nguyên bọc, giao tận nơi.'
  },
  {
    icon: ShieldCheck,
    title: 'Chất lượng đảm bảo',
    desc: 'Đạt tiêu chuẩn VSATTP, quy trình khép kín từ gạo đến thành phẩm. Đổi trả nếu không hài lòng.'
  }
]

const milestones = [
  {
    year: '1960',
    title: 'Khởi đầu',
    text: 'Bà nội bắt đầu làm bún gia đình tại xưởng nhỏ ở quê nhà, bán cho hàng xóm và chợ phiên.'
  },
  {
    year: '1990',
    title: 'Mở rộng',
    text: 'Bố mẹ tiếp quản, mở rộng quy mô sản xuất. Bún BunTech bắt đầu cung cấp cho các quán ăn, tiệm bún trong khu vực.'
  },
  {
    year: '2010',
    title: 'Phát triển',
    text: 'Đầu tư máy móc hiện đại, đạt tiêu chuẩn VSATTP. Phục vụ hơn 50 đại lý, sản lượng 500kg/ngày.'
  },
  {
    year: '2024',
    title: 'Chuyển đổi số',
    text: 'Ra mắt app BunTech — đặt hàng online, theo dõi đơn hàng và công nợ realtime. Sản lượng 1000+ kg/ngày.'
  }
]

const team = [
  {
    name: 'Nguyễn Thị Bích',
    role: 'CEO - Thuyền trưởng',
    bio: 'Đời thứ 3, kế thừa bí truyền gia đình. Tốt nghiệp ĐH Kinh tế, dẫn dắt BunTech chuyển đổi số.',
    avatar: ''
  },
  {
    name: 'Trần Văn Hùng',
    role: 'Giám đốc sản xuất',
    bio: '20 năm kinh nghiệm làm bún. Đảm bảo chất lượng từng mẻ bún từ khâu chọn gạo đến thành phẩm.',
    avatar: ''
  },
  {
    name: 'Lê Thị Mai',
    role: 'Giám đốc kinh doanh',
    bio: 'Quản lý mạng lưới 50+ đại lý. Xây dựng chính sách giá sỉ linh hoạt cho từng khách hàng.',
    avatar: ''
  },
  {
    name: 'Phạm Văn Nam',
    role: 'Giám đốc công nghệ',
    bio: 'Dẫn dắt chuyển đổi số BunTech. Xây dựng app đặt hàng và hệ thống quản lý đơn hàng.',
    avatar: ''
  }
]

const faqs = [
  {
    q: 'Bún BunTech có sử dụng hàn the không?',
    a: 'Tuyệt đối không. Bún BunTech được làm từ 100% gạo tự nhiên, sản xuất theo quy trình truyền thống 3 đời. Chúng tôi cam kết không sử dụng hàn the hay bất kỳ chất bảo quản nào.'
  },
  {
    q: 'Bún tươi để được bao lâu?',
    a: 'Bún tươi BunTech nên dùng trong ngày, tốt nhất trong vòng 24 giờ kể từ lúc sản xuất. Nếu bảo quản tủ lạnh có thể để 2-3 ngày, nhưng khuyến cáo dùng tươi để đảm bảo hương vị tốt nhất.'
  },
  {
    q: 'Làm thế nào để đặt hàng?',
    a: 'Bạn có thể đặt hàng qua app BunTech (nhanh nhất), gọi điện thoại trực tiếp, hoặc đến đại lý gần nhất. Đặt qua app sẽ được giao hàng tận nơi trong 2 giờ tại khu vực nội thành.'
  },
  {
    q: 'BunTech có giao hàng tận nơi không?',
    a: 'Có. Chúng tôi giao hàng tận nơi tại TP.HCM và các khu vực lân cận. Nội thành giao trong 2 giờ, ngoại thành trong 4 giờ. Đơn hàng sỉ được giao miễn phí.'
  },
  {
    q: 'Chính sách giá sỉ như thế nào?',
    a: 'BunTech có chính sách giá sỉ linh hoạt tùy theo số lượng và tần suất đặt hàng. Đơn hàng sỉ được giảm 10% so với giá lẻ. Liên hệ hotline để được tư vấn chính sách giá tốt nhất.'
  },
  {
    q: 'Nếu bún không đạt chất lượng có đổi trả không?',
    a: 'Có. BunTech cam kết đổi trả 100% nếu bún không đạt chất lượng (biến chất, mùi lạ, hư hỏng). Vui lòng liên hệ hotline trong vòng 2 giờ sau khi nhận hàng để được hỗ trợ.'
  }
]

const openFaq = ref(-1)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? -1 : index
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative flex min-h-[480px] items-center overflow-hidden">
      <div class="absolute inset-0">
        <NuxtImg :src="heroImage" alt="" class="h-full w-full object-cover" aria-hidden="true" />
        <div
          class="to-primary-950/70 absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/80"
        />
      </div>
      <div
        class="bg-primary-500/20 absolute top-1/4 -left-20 h-72 w-72 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        class="bg-accent-400/15 absolute right-0 bottom-0 h-80 w-80 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div
        class="relative mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8"
      >
        <div
          class="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
        >
          <Sparkles class="h-4 w-4" aria-hidden="true" />
          Xưởng bún truyền thống từ 1960
        </div>
        <h1
          class="animate-fade-in-up mb-5 text-3xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Hành trình 3 đời làm bún
        </h1>
        <p
          class="animate-fade-in-up mx-auto max-w-2xl text-lg leading-relaxed text-gray-200 sm:text-xl"
          style="animation-delay: 100ms"
        >
          Từ xưởng bún gia đình nhỏ năm 1960 đến thương hiệu bún tươi hàng đầu — BunTech vẫn giữ
          trọn tinh hoa bí truyền 3 đời.
        </p>
      </div>
    </section>

    <!-- Stats -->
    <section class="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="card animate-fade-in-up p-6 text-center"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <div
            class="bg-primary-50 dark:bg-primary-900/20 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
          >
            <component
              :is="stat.icon"
              class="text-primary-600 dark:text-primary-400 h-6 w-6"
              aria-hidden="true"
            />
          </div>
          <p class="text-surface-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-sm text-gray-500 dark:text-zinc-400">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Story -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div class="relative">
          <div class="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <NuxtImg
              src="https://images.pexels.com/photos/6711687/pexels-photo-6711687.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Xưởng bún BunTech"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div
            class="bg-primary-600 absolute -right-4 -bottom-4 -z-10 hidden h-32 w-32 rounded-2xl sm:block"
            aria-hidden="true"
          />
          <div
            class="bg-accent-400/20 absolute -top-4 -left-4 -z-10 hidden h-24 w-24 rounded-full sm:block"
            aria-hidden="true"
          />
        </div>
        <div>
          <div
            class="text-primary-600 dark:text-primary-400 mb-4 inline-flex items-center gap-2 text-sm font-medium"
          >
            <Target class="h-4 w-4" aria-hidden="true" />
            Sứ mệnh của chúng tôi
          </div>
          <h2 class="text-surface-foreground mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Bún tươi mỗi sáng — từ gia đình đến gia đình
          </h2>
          <p class="mb-4 leading-relaxed text-gray-600 dark:text-zinc-300">
            Năm 1960, bà nội chúng tôi bắt đầu làm bún tại một xưởng nhỏ trong hẻm. Bún làm tay,
            từng sợi mộc mạc, bán cho hàng xóm và chợ phiên. Khách quen gọi là "bún bà Tư" — ngon,
            sạch, rẻ.
          </p>
          <p class="mb-6 leading-relaxed text-gray-600 dark:text-zinc-300">
            Ba đời tiếp nối, bí truyền gia đình vẫn giữ nguyên. Nhưng cách làm bún thì ngày càng
            hiện đại — máy móc sạch sẽ, quy trình khép kín, đạt chuẩn VSATTP. Bún BunTech nay phục
            vụ hơn 50 đại lý, sản xuất 1000+ kg mỗi ngày, nhưng tinh hoa vẫn là tinh hoa.
          </p>
          <div
            class="text-primary-600 dark:text-primary-400 inline-flex items-center gap-2 text-sm font-medium"
          >
            <Eye class="h-4 w-4" aria-hidden="true" />
            Tầm nhìn
          </div>
          <p class="mt-2 leading-relaxed text-gray-600 dark:text-zinc-300">
            Trở thành thương hiệu bún tươi số 1 Việt Nam — giữ gìn truyền thống, ứng dụng công nghệ,
            phục vụ cộng đồng.
          </p>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="bg-surface py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
            Giá trị cốt lõi
          </h2>
          <p class="text-sm text-gray-500 dark:text-zinc-400">
            Những nguyên tắc chúng tôi giữ suốt 60+ năm
          </p>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(value, i) in values"
            :key="i"
            class="card card-hover animate-fade-in-up p-6"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div
              class="bg-primary-50 dark:bg-primary-900/20 mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            >
              <component
                :is="value.icon"
                class="text-primary-600 dark:text-primary-400 h-6 w-6"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-surface-foreground mb-1.5 font-semibold">{{ value.title }}</h3>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-zinc-400">{{ value.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <h2
        class="text-surface-foreground mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl"
      >
        Cột mốc phát triển
      </h2>
      <div class="relative">
        <div
          class="bg-surface-border absolute top-0 bottom-0 left-4 w-0.5 sm:left-1/2"
          aria-hidden="true"
        />
        <div
          v-for="(milestone, i) in milestones"
          :key="i"
          :class="[
            'animate-fade-in-up relative mb-8 flex items-center',
            i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
          ]"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <div class="hidden flex-1 sm:block" />
          <div
            class="bg-primary-600 ring-primary-100 dark:ring-primary-900/30 absolute left-4 h-3 w-3 -translate-x-1/2 rounded-full ring-4 sm:left-1/2"
            aria-hidden="true"
          />
          <div class="ml-12 sm:ml-0 sm:w-1/2 sm:px-8">
            <div class="card card-hover p-5">
              <p class="text-primary-600 dark:text-primary-400 mb-1 text-lg font-bold">
                {{ milestone.year }}
              </p>
              <p class="text-surface-foreground mb-1 text-sm font-semibold">
                {{ milestone.title }}
              </p>
              <p class="text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
                {{ milestone.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="bg-surface py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
            Đội ngũ BunTech
          </h2>
          <p class="text-sm text-gray-500 dark:text-zinc-400">
            Những người tâm huyết giữ gìn truyền thống 3 đời
          </p>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(member, i) in team"
            :key="i"
            class="card card-hover animate-fade-in-up p-6 text-center"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div
              class="from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/10 ring-primary-100 dark:ring-primary-900/30 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ring-1"
            >
              <AppAvatar :name="member.name" size="lg" />
            </div>
            <h3 class="text-surface-foreground mb-0.5 font-semibold">{{ member.name }}</h3>
            <p class="text-primary-600 dark:text-primary-400 mb-2 text-sm font-medium">
              {{ member.role }}
            </p>
            <p class="text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <h2
        class="text-surface-foreground mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl"
      >
        Câu hỏi thường gặp
      </h2>
      <div class="space-y-3">
        <div v-for="(faq, i) in faqs" :key="i" class="card overflow-hidden">
          <UButton
            variant="ghost"
            color="neutral"
            type="button"
            class="text-surface-foreground hover:bg-surface-hover flex min-h-[44px] w-full items-center justify-between p-4 text-left font-medium transition-colors"
            :aria-expanded="openFaq === i"
            @click="toggleFaq(i)"
          >
            {{ faq.q }}
            <ChevronRight
              :class="[
                'ml-2 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 dark:text-zinc-500',
                openFaq === i ? 'rotate-90' : ''
              ]"
              aria-hidden="true"
            />
          </UButton>
          <div
            v-show="openFaq === i"
            class="animate-fade-in px-4 pb-4 text-sm leading-relaxed text-gray-600 dark:text-zinc-300"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div
        class="from-primary-600 to-primary-800 relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <div
          class="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="bg-accent-400/10 absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div class="relative">
          <h2 class="mb-4 text-2xl font-bold text-white sm:text-3xl">
            Trải nghiệm bún tươi BunTech
          </h2>
          <p class="mx-auto mb-8 max-w-xl text-white/80">
            Đặt hàng online trong 30 giây, giao hàng tận nơi trong 2 giờ. Bún tươi mỗi sáng, từ
            xưởng đến bàn ăn của bạn.
          </p>
          <div class="flex flex-col justify-center gap-3 sm:flex-row">
            <NuxtLink to="/quick-order">
              <UButton
                color="primary"
                size="lg"
                class="!text-primary-600 group !bg-white hover:!bg-white/90"
              >
                Đặt hàng ngay
                <ChevronRight
                  class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </UButton>
            </NuxtLink>
            <a href="tel:+84901234567">
              <UButton
                variant="outline"
                size="lg"
                class="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
              >
                <Phone class="h-4 w-4" aria-hidden="true" />
                Gọi hotline
              </UButton>
            </a>
          </div>
          <div class="mt-6 flex items-center justify-center gap-2 text-sm text-white/60">
            <MapPin class="h-4 w-4" aria-hidden="true" />
            123 Lê Lợi, Q.1, TP.HCM
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
