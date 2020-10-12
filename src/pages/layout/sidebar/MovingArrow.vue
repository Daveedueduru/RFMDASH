<template>
  <div class="moving-arrow" :style="arrowStyle">
  </div>
</template>
<script>
export default {
  props: {
    moveY: {
      type: Number,
      default: 0
    }
  },
  computed: {
    /**
     * Styles to animate the arrow
     * @returns {{transform: string}}
     */
    arrowStyle() {
      return {
        transform: `translate3d(0px, ${this.moveY}px, 0px)`
      };
    }
  }
};
</script>
<style lang="scss">
.moving-arrow {
  border-right: 27px solid #ffffff;
  border-top: 27px solid transparent;
  border-bottom: 27px solid transparent;
  display: inline-block;
  position: absolute;
  left: 203px;
  top: 63px;
  transition: all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1);
}
@media (max-width: 992px) {
  .moving-arrow {
    display: none;
  }
}
</style>
