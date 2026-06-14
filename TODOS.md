# TODOS

- [ ] nicer colorful identity ([something like this ?](https://www.iconfinder.com/icons/44859/cube_icon))
- [ ] detect user in/activity to refresh data
- [ ] show given/thrown items with a different color/display, also they're no more in box/room
- [ ] features to recover :
  - [ ] clone item
  - [ ] search retry when scan, search, or speech fail
  - [ ] print un-printed items

## Design / UI

- **Re-implement item selection in metrics page**
  **Priority:** P2
  Selection UI (checkboxes on list entries) was removed in the new design refactor.
  The `PriceButtons` component and `MetricCardMissingPriceList` price-update workflow
  remain but are dormant until selection is re-wired via the new design language.

- **CSS columns layout — keyboard navigation order**
  **Priority:** P3
  `AppItemList` card view uses CSS `columns` layout which presents items in column-first
  DOM order. Screen readers follow DOM order rather than visual order; consider
  CSS Grid as an alternative if accessibility testing reveals confusion.

## Completed
