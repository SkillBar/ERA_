# Диагностика outside-close: инструкция и интерпретация логов

Временный диагностический патч добавлен в `SearchAutocomplete.tsx` и `Header.tsx`: логи только в `import.meta.env.DEV`.

## Что добавлено

- **SearchAutocomplete:** проп `debugName?: "desktop" | "mobile"`; логи в `close()`, onFocus/onBlur/onChange, `handleWrapperClick`, document pointerdown/keydown, useLayoutEffect (portalRect), render; mount/unmount effect; overlay pointerdown. Защита от переоткрытия: `closingRef` в `close()` и проверка в onFocus.
- **Header:** логи в `closeAllSearch()`, все вызовы `setSearchExpanded(true/false)`, `closeMenu()`, header `onPointerDownCapture`, клик по кнопке поиска, клик по кнопке меню, render; mount/unmount; ветки «рендер мобильного поиска» / «рендер кнопки поиска».

---

## Действия для проверки

1. **Сборка и запуск (dev):** `npm run dev`, открыть консоль браузера (F12 → Console).
2. **Десктоп:**
   - Открыть поиск (клик по полю, ввести символ).
   - Кликнуть по логотипу / по кнопке меню / по свитчеру темы / по кнопке «Войти».
   - Смотреть порядок логов: `[SEARCH:desktop]`, `[HEADER]`, кто вызвал `close()`, приходит ли document pointerdown, что сразу после `close()`.
3. **Мобильный вид (или узкое окно):**
   - Нажать кнопку поиска (лупа) → должен появиться мобильный поиск.
   - Открыть выпадающий список (ввести символ).
   - Кликнуть по логотипу / по кнопке меню / по теме.
   - Смотреть: `[SEARCH:mobile]` vs `[SEARCH:desktop]`, mount/unmount мобильного поиска, вызовы `setSearchExpanded(true/false)` и `close()`.
4. **Повторное открытие после закрытия:**
   - Открыть поиск, кликнуть «вне» (например по логотипу).
   - Сразу смотреть: есть ли после `[SEARCH:*] close() called` лог `input onFocus` или `handleWrapperClick` или `setSearchExpanded(true)` — это будет кандидат на переоткрытие.

---

## Интерпретация последовательностей логов

### 1. `close()` вызывается, но сразу после него — `input onFocus` (тот же или другой экземпляр)

- **Вывод:** поиск переоткрывается из-за фокуса на input (например, клик «вне» фокусирует поле или другой инстанс).
- **Что проверить:** не даёт ли header/overlay клик дойти до input; не вызывается ли `focus()` после `close()` (например из `useEffect` при `searchExpanded` в Header).

### 2. `close()` вызывается, затем сразу `handleWrapperClick (trigger click) → focus()`

- **Вывод:** клик по «вне» попадает в область trigger (корень/обёртка), срабатывает `handleWrapperClick` и фокус переоткрывает панель.
- **Что проверить:** размер/область элемента с `data-search-trigger`; не перекрывает ли он нечаянно header.

### 3. `close()` вызывается, затем сразу `setSearchExpanded(true)` или `[HEADER] setSearchExpanded(true)`

- **Вывод:** что-то снова открывает мобильный поиск (например повторный клик по кнопке лупы или другой обработчик).
- **Что проверить:** не висит ли на кнопке поиска двойной клик; не вызывается ли `setSearchExpanded(true)` из эффекта/обработчика после закрытия.

### 4. Document `pointerdown` не приходит при клике по header (нет лога `[SEARCH:*] document pointerdown`)

- **Вывод:** событие не доходит до document (например перехват/stopPropagation) или панель уже закрыта к этому моменту.
- **Что проверить:** порядок срабатывания: сначала `[HEADER] capture pointerdown`, потом `[SEARCH:*] document pointerdown`; не снят ли listener из-за раннего unmount или смены `panelOpen`.

### 5. Document `pointerdown` приходит, но `insideTrigger: true` или `insideDropdown: true` при клике по логотипу/меню

- **Вывод:** ошибочно считается, что клик «внутри» (область trigger/dropdown слишком большая или портал рендерит в неожиданном месте).
- **Что проверить:** какой `target` в логе; не попадает ли портал/overlay в тот же DOM-поддерева, что и `[data-search-trigger]` / `[data-search-dropdown]`.

### 6. `closeAllSearch called`, но потом рендер поиска всё ещё с `panelOpen: true` / панель визуально не исчезает

- **Вывод:** состояние не обновляется там, где ожидается, или закрывается не тот экземпляр.
- **Что проверить:** в логах — какой экземпляр вызвал `close()` (desktop/mobile); после `closeAllSearch` есть ли `[SEARCH:desktop] close() called` и `[SEARCH:mobile] close() called` (если оба смонтированы); не перезаписывает ли что-то `isOpen` обратно в `true` (например onFocus).

### 7. `[SEARCH:mobile] unmounted`, затем сразу `[SEARCH:desktop] render` с `panelOpen: true` (или наоборот)

- **Вывод:** при переключении desktop/mobile закрывается один экземпляр, но открыт остаётся другой (или переоткрывается).
- **Что проверить:** при клике «вне» на мобильном — вызывается ли `close()` у mobile до unmount; не открывается ли desktop при переключении viewport.

### 8. После `close()` есть лог `focus ignored because closingRef=true`

- **Вывод:** защита сработала: focus действительно пытался переоткрыть поиск сразу после close.
- **Действие:** значит переоткрытие идёт через onFocus; искать, кто вызывает `focus()` после outside-клика (например focus management в Header или фокус на другой инстанс).

### 9. `[HEADER] capture pointerdown` не логируется при клике по header

- **Вывод:** клик по header не доходит до header (например overlay перекрывает и перехватывает).
- **Что проверить:** z-index overlay и header; не рендерится ли overlay поверх header и не вызывается ли там `preventDefault`/stopPropagation.

### 10. Много раз подряд `[SEARCH:*] render` с разными `panelOpen` или несколько `close() called` подряд

- **Вывод:** возможен race или множественные источники закрытия/открытия.
- **Что проверить:** порядок: document pointerdown → close(); header capture → closeAllSearch(); не вызываются ли оба и не даёт ли это двойного закрытия/переоткрытия.

---

## Отключение диагностики

- Логи обёрнуты в `import.meta.env.DEV` — в production-сборке их нет.
- Чтобы убрать диагностику из кода: удалить все блоки `if (import.meta.env.DEV) { ... }` с логами, проп `debugName`, `closingRef` и логику с ним в SearchAutocomplete; в Header — только логи.
