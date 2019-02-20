<template>
    <Split v-model="this_split" class="split-container">
        <div slot="left" class="split-pane left">
            <slot name="left"></slot>
        </div>
        <div slot="trigger" class="split-vertical">
            <div class="split-vertical-dots">
                <span class="dot" ></span>
                <span class="dot" ></span>
                <span class="dot" ></span>
                <span class="dot" ></span>
                <span class="dot" ></span>
            </div>
        </div>
        <div slot="right" class="split-pane right">
            <slot name="right"></slot>
        </div>
    </Split>
</template>
<script>
  export default {
    data () {
      return {
        this_split: 0.5
      }
    },
    created () {
      this.this_split = this.split
    },
    props: {
      split: {
        type: Number,
      }
    }
  }
</script>
<style lang="scss">
    .split-container {
        height: 100%;

        .split-pane.left {
            padding: 2px 2px 2px 2px;
        }

        .split-pane.right {
            padding: 2px 2px 2px 6px;
        }

        .split-vertical {
            height: 100%;
            width: 6px;
            background-color: $page-background-color;
            cursor: col-resize;
            .split-vertical-dots {
                top: 50%;
                left: 1px;
                height: 40px;
                width: 6px;
                position: absolute;
                overflow: hidden;
                .dot {
                    background-color: darken($page-background-color, 30%);
                    height: 4px;
                    width: 4px;
                    border-radius: 2px;
                    margin-top: 3px;
                    display: block;
                }
            }
        }
    }
</style>
