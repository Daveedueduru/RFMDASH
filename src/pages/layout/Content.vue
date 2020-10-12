<template>
  <div class="content" id="contentPanel">
    <div class="container-fluid">
      <transition name="fade" mode="out-in">
        <!-- your content here -->
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter, .fade-leave-to{
  opacity: 0;
}
#contentPanel{
  height: calc(100% - 55px);
}
</style>
