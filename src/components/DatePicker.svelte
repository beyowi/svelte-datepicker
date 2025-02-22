<script>
  import Popover from './Popover.svelte'
  import { dayjs } from './lib/date-utils'
  import { contextKey, setup } from './lib/context'
  import { createEventDispatcher, setContext, getContext } from 'svelte'
  import { CalendarStyle } from '../calendar-style.js'
  import { createViewContext } from './lib/view-context.js'
  import Toolbar from './Toolbar.svelte'
  import View from './view/View.svelte'

  export let range = false
  export let placeholder = 'Choose Date'
  export let format = 'DD / MM / YYYY'
  export let start = dayjs().subtract(1, 'year')
  export let end = dayjs().add(1, 'year')
  export let trigger = null
  export let selectableCallback = null
  export let styling = new CalendarStyle()
  export let selected
  export let closeOnFocusLoss = true
  export let time = false
  export let morning = 7
  export let night = 19
  export let minuteStep = 5
  export let continueText = 'Continue'
  export let canClear = true;
  export let mobileTopOffset = 0;

  const dispatch = createEventDispatcher()

  const startContextKey = {}
  const endContextKey = {}

  const config = {
    start: dayjs(start),
    end: dayjs(end),
    isRangePicker: range,
    isTimePicker: time,
    closeOnFocusLoss,
    format,
    morning,
    night,
    selectableCallback,
    minuteStep: parseInt(minuteStep)
  }

  setContext(contextKey, setup(selected, config))
  const {
    selectedStartDate,
    selectedEndDate,
    isOpen,
    isClosing,
    highlighted,
    formatter,
    isDateChosen,
    isSelectingFirstDate
  } = getContext(contextKey)

  setContext(startContextKey, createViewContext(true, getContext(contextKey)))

  if (config.isRangePicker) {
    setContext(endContextKey, createViewContext(false, getContext(contextKey)))
  }

  let popover

  function initialisePicker () {
    highlighted.set($selectedStartDate)
    dispatch('open')
  }
  
  function setRangeValue () {
    selected = [ $selectedStartDate, $selectedEndDate ]
    dispatch('range-selected', {
      from: $selectedStartDate.toDate(),
      to: $selectedEndDate.toDate()
    })
  }

  function setDateValue () {
    selected = $selectedStartDate.toDate()
    dispatch('date-selected', {
      date: $selectedStartDate.toDate()
    })
  }

  function swapDatesIfRequired () {
    if (!config.isRangePicker) { return }
    const from = $selectedStartDate
    const to = $selectedEndDate
    if (to.isBefore(from)) {
      selectedStartDate.set(to)
      selectedEndDate.set(from)
    }
  }

  function addDate (e) {
    const { date } = e.detail
    if ($isSelectingFirstDate) {
      selectedStartDate.set(date)
    } else {
      selectedEndDate.set(date)
    }
    swapDatesIfRequired()
    config.isRangePicker && isSelectingFirstDate.update(v => !v)
  }

  function close () {
    swapDatesIfRequired()
    popover.close()
  }

  export function clearHandler () {
    isDateChosen.set(false)
    dispatch('clear')
  }

  $: {
    if ($isDateChosen) {
      config.isRangePicker ? setRangeValue() : setDateValue()
      dispatch('change')
    }
  }
</script>

<style>
  .datepicker {
    display: inline-block;
    text-align: center;
    overflow: visible;
    width: var(--datepicker-width);
    position: relative;
  }

  .calendar-button {
    padding: var(--button-padding);
    border: 1px solid var(--button-border-color);
    display: block;
    text-align: center;
    width: var(--button-width);
    text-decoration: none;
    cursor: pointer;
    background: var(--button-background-color);
    color: var(--button-text-color);
    border-radius: var(--button-radius);
    box-shadow: var(--button-box-shadow);
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  .contents {
    min-width: 320px;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: var(--content-background);
  }

  .view {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .close {
    position: absolute;
    right: 5px;
    top: 20%;
    bottom: 20%;
    margin: auto 0;
    width: 30px;
    height: 30px;
    opacity: 0.3;
    background: none;
    color: inherit;
    border: none;
    padding: 0;
  }

  .close:before, .close:after {
  position: absolute;
  left: 15px;
  content: ' ';
  height: 15px;
  width: 2px;
  top: 0;
  bottom: 0;
  margin: auto 0;
  background-color: #333;
}
.close:before {
  transform: rotate(45deg);
}
.close:after {
  transform: rotate(-45deg);
}

  @media (min-width: 680px) {
    .view {
      flex-direction: row;
      justify-content: center;
    }
  }
</style>

<div
  class="datepicker"
  class:open={$isOpen}
  class:closing={$isClosing}
  style={styling.toWrapperStyle()}>
  <Popover
    {trigger}
    {mobileTopOffset}
    bind:this={popover}
    on:opened={initialisePicker}
    on:closed={() => dispatch('close')}>
    <div slot="trigger">
      <slot formatted={$formatter}>
        {#if !trigger}
          <button class="calendar-button" type="button">
            {#if $isDateChosen}
              {$formatter.formattedCombined}
            {:else}
              {placeholder}
            {/if}
          </button>
        {/if}
      </slot>
    </div>
    <div class="contents" slot="contents" class:is-range-picker={config.isRangePicker}>
      <div class="view">
        <View
          viewContextKey={startContextKey}
          on:chosen={addDate}
        />
        {#if config.isRangePicker}
        <View
          viewContextKey={endContextKey}
          on:chosen={addDate}
        />
        {/if}
      </div>
      <Toolbar continueText={continueText} on:close={close} />
    </div>
  </Popover>
  {#if canClear && $isDateChosen}
    <button aria-label="Reset date" class='close' on:click={clearHandler}/>
  {/if}
</div>
