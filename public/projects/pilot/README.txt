Чтобы использовать СВОИ картинки для Pilot:

1. Положите сюда 3 файла с именами:
   - hero.jpg       — баннер на странице проекта
   - logo.png       — логотип PILOT
   - description.jpg — фото в блоке «О проекте»

2. В коде замените заглушки на локальные пути:
   - src/data/projectDetails.ts: heroImageUrl → "/projects/pilot/hero.jpg", logoUrl → "/projects/pilot/logo.png", fullDescriptionImageUrl → "/projects/pilot/description.jpg"
   - src/data/projects.ts: у Pilot в imageUrl подставьте "/projects/pilot/hero.jpg" для карточки на главной

Сейчас используются онлайн-заглушки (Unsplash), поэтому картинки грузятся без этих файлов.
