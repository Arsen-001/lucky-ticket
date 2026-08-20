# Лица массовки

40 портретов из датасета **SFHQ (Synthetic Faces High Quality)**,
https://github.com/SelfishGene/SFHQ-dataset — **MIT-лицензия**.

🔴 **Здесь нет ни одного настоящего человека.** Все лица синтезированы
(StyleGAN2 поверх нефотографических источников), авторы датасета прямо пишут:
«Since all images in this dataset are synthetically generated there are no
privacy issues or license issues surrounding these images».

Именно поэтому они и взяты: массовка — несуществующие аккаунты на живом
продукте, и ставить им лица реальных людей нельзя ни юридически, ни
по-человечески. Обратный поиск по такой картинке тоже никого не найдёт.

Нарезаны из демонстрационных листов репозитория (`images/SFHQ_sample_4x8.jpg`
и `images/SFHQ_variability_ethnicity.jpg`), приведены к 256×256. Младенец и
одно откровенно нарисованное лицо выброшены: массовка изображает взрослых
игроков.

Кто их раздаёт: `AVATAR_SRCS` в `lucky-ticket-backend/src/seed-players/
seed-players.util.ts`. Свои картинки грузятся поверх — партией в панели
(Пользователи → Массовка).
