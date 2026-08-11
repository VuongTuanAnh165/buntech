const fs = require('fs')
const fix = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8')
  for (const [from, to] of replacements) {
    content = content.replace(from, to)
  }
  fs.writeFileSync(file, content)
}

// 1. AddressFormModal.vue
fix('app/components/features/admin/customers/AddressFormModal.vue', [
  [/@click="\(\) => isOpen = false"/g, '@click="() => { isOpen = false }"']
])

// 2. CustomerFormDrawer.vue
fix('app/components/features/admin/customers/CustomerFormDrawer.vue', [
  [/@click="\(\) => isOpen = false"/g, '@click="() => { isOpen = false }"'],
  [/form\.value\.role = /g, 'if(form.value) form.value.role = '],
  [/form\.value\.status = /g, 'if(form.value) form.value.status = ']
])

// 3. [id].vue
fix('app/pages/admin/customers/[id].vue', [
  [
    /@click="\(\) => navigateTo\('\/admin\/customers'\)"/g,
    '@click="() => { navigateTo(\'/admin/customers\') }"'
  ],
  [/@click="showCustomerEdit = true"/g, '@click="() => { showCustomerEdit = true }"']
])

// 4. index.vue
fix('app/pages/admin/customers/index.vue', [
  [/:rows="usersList"/g, ':rows="(usersList as any[])"'],
  [/statusOptions\.value\[1\]\.value/g, 'statusOptions.value[1]!.value'],
  [/statusOptions\.value\[2\]\.value/g, 'statusOptions.value[2]!.value']
])

console.log('Fixed typescript issues')
