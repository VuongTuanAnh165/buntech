<script setup lang="ts">
import { Sparkles, Award, Users, Heart, Leaf, Truck, Target, Eye, MapPin, Phone, ChevronRight, Factory, ShieldCheck } from 'lucide-vue-next'


useHead({ title: 'Về chúng tôi - BunTech' })
definePageMeta({ layout: 'default' })

const heroImage = 'https://images.pexels.com/photos/1001773/pexels-photo-1001773.jpeg?auto=compress&cs=tinysrgb&w=1600'

const stats = [
  { value: '60+ năm', label: 'Kinh nghiệm truyền thống', icon: Award },
  { value: '50+', label: 'Đại lý phục vụ', icon: Users },
  { value: '100%', label: 'Gạo tự nhiên', icon: Leaf },
  { value: '1000+ kg', label: 'Sản xuất mỗi ngày', icon: Factory },
]

const values = [
  { icon: Leaf, title: 'Nguyên liệu tự nhiên', desc: '100% gạo tự nhiên tuyển chọn, không chất bảo quản, không hàn the. An toàn cho sức khỏe gia đình bạn.' },
  { icon: Heart, title: 'Tận tâm phục vụ', desc: 'Khách hàng là người thân. Chúng tôi chăm chút từng bọc bún như chính bún nhà mình ăn.' },
  { icon: Truck, title: 'Giao hàng nhanh chóng', desc: 'Nội thành 2 giờ, ngoại thành 4 giờ. Bún tươi nóng nguyên bọc, giao tận nơi.' },
  { icon: ShieldCheck, title: 'Chất lượng đảm bảo', desc: 'Đạt tiêu chuẩn VSATTP, quy trình khép kín từ gạo đến thành phẩm. Đổi trả nếu không hài lòng.' },
]

const milestones = [
  { year: '1960', title: 'Khởi đầu', text: 'Bà nội bắt đầu làm bún gia đình tại xưởng nhỏ ở quê nhà, bán cho hàng xóm và chợ phiên.' },
  { year: '1990', title: 'Mở rộng', text: 'Bố mẹ tiếp quản, mở rộng quy mô sản xuất. Bún BunTech bắt đầu cung cấp cho các quán ăn, tiệm bún trong khu vực.' },
  { year: '2010', title: 'Phát triển', text: 'Đầu tư máy móc hiện đại, đạt tiêu chuẩn VSATTP. Phục vụ hơn 50 đại lý, sản lượng 500kg/ngày.' },
  { year: '2024', title: 'Chuyển đổi số', text: 'Ra mắt app BunTech — đặt hàng online, theo dõi đơn hàng và công nợ realtime. Sản lượng 1000+ kg/ngày.' },
]

const team = [
  { name: 'Nguyễn Thị Bích', role: 'CEO - Thuyền trưởng', bio: 'Đời thứ 3, kế thừa bí truyền gia đình. Tốt nghiệp ĐH Kinh tế, dẫn dắt BunTech chuyển đổi số.', avatar: '' },
  { name: 'Trần Văn Hùng', role: 'Giám đốc sản xuất', bio: '20 năm kinh nghiệm làm bún. Đảm bảo chất lượng từng mẻ bún từ khâu chọn gạo đến thành phẩm.', avatar: '' },
  { name: 'Lê Thị Mai', role: 'Giám đốc kinh doanh', bio: 'Quản lý mạng lưới 50+ đại lý. Xây dựng chính sách giá sỉ linh hoạt cho từng khách hàng.', avatar: '' },
  { name: 'Phạm Văn Nam', role: 'Giám đốc công nghệ', bio: 'Dẫn dắt chuyển đổi số BunTech. Xây dựng app đặt hàng và hệ thống quản lý đơn hàng.', avatar: '' },
]

const faqs = [
  { q: 'Bún BunTech có sử dụng hàn the không?', a: 'Tuyệt đối không. Bún BunTech được làm từ 100% gạo tự nhiên, sản xuất theo quy trình truyền thống 3 đời. Chúng tôi cam kết không sử dụng hàn the hay bất kỳ chất bảo quản nào.' },
  { q: 'Bún tươi để được bao lâu?', a: 'Bún tươi BunTech nên dùng trong ngày, tốt nhất trong vòng 24 giờ kể từ lúc sản xuất. Nếu bảo quản tủ lạnh có thể để 2-3 ngày, nhưng khuyến cáo dùng tươi để đảm bảo hương vị tốt nhất.' },
  { q: 'Làm thế nào để đặt hàng?', a: 'Bạn có thể đặt hàng qua app BunTech (nhanh nhất), gọi điện thoại trực tiếp, hoặc đến đại lý gần nhất. Đặt qua app sẽ được giao hàng tận nơi trong 2 giờ tại khu vực nội thành.' },
  { q: 'BunTech có giao hàng tận nơi không?', a: 'Có. Chúng tôi giao hàng tận nơi tại TP.HCM và các khu vực lân cận. Nội thành giao trong 2 giờ, ngoại thành trong 4 giờ. Đơn hàng sỉ được giao miễn phí.' },
  { q: 'Chính sách giá sỉ như thế nào?', a: 'BunTech có chính sách giá sỉ linh hoạt tùy theo số lượng và tần suất đặt hàng. Đơn hàng sỉ được giảm 10% so với giá lẻ. Liên hệ hotline để được tư vấn chính sách giá tốt nhất.' },
  { q: 'Nếu bún không đạt chất lượng có đổi trả không?', a: 'Có. BunTech cam kết đổi trả 100% nếu bún không đạt chất lượng (biến chất, mùi lạ, hư hỏng). Vui lòng liên hệ hotline trong vòng 2 giờ sau khi nhận hàng để được hỗ trợ.' },
]

const openFaq = ref(-1)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? -1 : index
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden min-h-[480px] flex items-center">
      <div class="absolute inset-0">
        <NuxtImg :src="heroImage" alt="" class="w-full h-full object-cover" aria-hidden="true" />
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/80 to-primary-950/70" />
      </div>
      <div class="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary-500/20 blur-3xl" aria-hidden="true" />
      <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent-400/15 blur-3xl" aria-hidden="true" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center w-full">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium mb-6 animate-fade-in">
          <Sparkles class="w-4 h-4" aria-hidden="true" />
          Xưởng bún truyền thống từ 1960
        </div>
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5 animate-fade-in-up leading-tight">
          Hành trình 3 đời làm bún
        </h1>
        <p class="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style="animation-delay: 100ms">
          Từ xưởng bún gia đình nhỏ năm 1960 đến thương hiệu bún tươi hàng đầu — BunTech vẫn giữ trọn tinh hoa bí truyền 3 đời.
        </p>
      </div>
    </section>

    <!-- Stats -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="card p-6 text-center animate-fade-in-up"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <div class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3">
            <component :is="stat.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <p class="text-2xl sm:text-3xl font-bold text-surface-foreground tracking-tight">{{ stat.value }}</p>
          <p class="text-sm text-gray-500 dark:text-zinc-400 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Story -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="relative">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <NuxtImg src="https://images.pexels.com/photos/6711687/pexels-photo-6711687.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Xưởng bún BunTech" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-primary-600 -z-10 hidden sm:block" aria-hidden="true" />
          <div class="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-accent-400/20 -z-10 hidden sm:block" aria-hidden="true" />
        </div>
        <div>
          <div class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 mb-4">
            <Target class="w-4 h-4" aria-hidden="true" />
            Sứ mệnh của chúng tôi
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-4 tracking-tight">Bún tươi mỗi sáng — từ gia đình đến gia đình</h2>
          <p class="text-gray-600 dark:text-zinc-300 leading-relaxed mb-4">
            Năm 1960, bà nội chúng tôi bắt đầu làm bún tại một xưởng nhỏ trong hẻm. Bún làm tay, từng sợi mộc mạc, bán cho hàng xóm và chợ phiên. Khách quen gọi là "bún bà Tư" — ngon, sạch, rẻ.
          </p>
          <p class="text-gray-600 dark:text-zinc-300 leading-relaxed mb-6">
            Ba đời tiếp nối, bí truyền gia đình vẫn giữ nguyên. Nhưng cách làm bún thì ngày càng hiện đại — máy móc sạch sẽ, quy trình khép kín, đạt chuẩn VSATTP. Bún BunTech nay phục vụ hơn 50 đại lý, sản xuất 1000+ kg mỗi ngày, nhưng tinh hoa vẫn là tinh hoa.
          </p>
          <div class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400">
            <Eye class="w-4 h-4" aria-hidden="true" />
            Tầm nhìn
          </div>
          <p class="text-gray-600 dark:text-zinc-300 leading-relaxed mt-2">
            Trở thành thương hiệu bún tươi số 1 Việt Nam — giữ gìn truyền thống, ứng dụng công nghệ, phục vụ cộng đồng.
          </p>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="bg-surface py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-2">Giá trị cốt lõi</h2>
          <p class="text-sm text-gray-500 dark:text-zinc-400">Những nguyên tắc chúng tôi giữ suốt 60+ năm</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(value, i) in values"
            :key="i"
            class="card card-hover p-6 animate-fade-in-up"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
              <component :is="value.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h3 class="font-semibold text-surface-foreground mb-1.5">{{ value.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{{ value.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-12 text-center tracking-tight">Cột mốc phát triển</h2>
      <div class="relative">
        <div class="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-surface-border" aria-hidden="true" />
        <div
          v-for="(milestone, i) in milestones"
          :key="i"
          :class="[
            'relative flex items-center mb-8 animate-fade-in-up',
            i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse',
          ]"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <div class="hidden sm:block flex-1" />
          <div class="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/30" aria-hidden="true" />
          <div class="ml-12 sm:ml-0 sm:w-1/2 sm:px-8">
            <div class="card card-hover p-5">
              <p class="text-lg font-bold text-primary-600 dark:text-primary-400 mb-1">{{ milestone.year }}</p>
              <p class="font-semibold text-surface-foreground mb-1 text-sm">{{ milestone.title }}</p>
              <p class="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">{{ milestone.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="bg-surface py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-2">Đội ngũ BunTech</h2>
          <p class="text-sm text-gray-500 dark:text-zinc-400">Những người tâm huyết giữ gìn truyền thống 3 đời</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(member, i) in team"
            :key="i"
            class="card card-hover p-6 text-center animate-fade-in-up"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-primary-100 dark:ring-primary-900/30">
              <AppAvatar :name="member.name" size="lg" />
            </div>
            <h3 class="font-semibold text-surface-foreground mb-0.5">{{ member.name }}</h3>
            <p class="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{{ member.role }}</p>
            <p class="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-8 text-center tracking-tight">Câu hỏi thường gặp</h2>
      <div class="space-y-3">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="card overflow-hidden"
        >
          <button
            type="button"
            class="w-full p-4 flex items-center justify-between text-left font-medium text-surface-foreground hover:bg-surface-hover transition-colors min-h-[44px]"
            :aria-expanded="openFaq === i"
            @click="toggleFaq(i)"
          >
            {{ faq.q }}
            <ChevronRight
              :class="['w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform duration-300 flex-shrink-0 ml-2', openFaq === i ? 'rotate-90' : '']"
              aria-hidden="true"
            />
          </button>
          <div
            v-show="openFaq === i"
            class="px-4 pb-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed animate-fade-in"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 sm:px-12 py-12 sm:py-16 text-center">
        <div class="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div class="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" aria-hidden="true" />
        <div class="relative">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Trải nghiệm bún tươi BunTech</h2>
          <p class="text-white/80 mb-8 max-w-xl mx-auto">Đặt hàng online trong 30 giây, giao hàng tận nơi trong 2 giờ. Bún tươi mỗi sáng, từ xưởng đến bàn ăn của bạn.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <NuxtLink to="/quick-order">
              <UButton color="primary" size="lg" class="!bg-white !text-primary-600 hover:!bg-white/90 group">
                Đặt hàng ngay
                <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </UButton>
            </NuxtLink>
            <a href="tel:+84901234567">
              <UButton variant="outline" size="lg" class="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20">
                <Phone class="w-4 h-4" aria-hidden="true" />
                Gọi hotline
              </UButton>
            </a>
          </div>
          <div class="flex items-center justify-center gap-2 mt-6 text-sm text-white/60">
            <MapPin class="w-4 h-4" aria-hidden="true" />
            123 Lê Lợi, Q.1, TP.HCM
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
