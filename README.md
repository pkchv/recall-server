# Hypercards
Hypercards strive to be a flashcards app powered by hypertext, spaced repetition algorithms and web technologies. This repository hosts the server-side service built with [Node.js](https://nodejs.org), [Express](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/).

## Concepts
#### Card
[Card](https://en.wikipedia.org/wiki/Flashcard) is a document with a single, isolated piece of knowledge (e.g. definition, equation, concept) that's supposed to be designed in a way that stimulates active recall during learning. Active recall is achieved by further dividing knowledge into cues (that are showed first and stimulate recall process) and answers (revealed later).

#### Deck
Deck is a collection of related cards (e.g. math, english vocabulary, javascript concepts).

#### Spaced repetition
[Spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition) is a learning technique. The basic idea is to divide knowledge into concepts (cards) and vary their review frequency as to spend the most time possible acquiring new knowledge and relearning forgotten or soon to be forgotten concepts (as opposed to reviewing cards that are already well known to the user).

#### Scheduling algorithm
Scheduling algorithm realizes spaced repetition. Scheduler decides review time of a card in a way that will maximize information retention time while minimizing users workload. In practice this is usually achieved based on users self assestment of active recall (how easy it was to recall a given concept).

Most extensively used scheduling algorithm for spaced repetition learning as far as I know is [SM2 algorithm](https://www.supermemo.com/english/ol/sm2.htm) by [Piotr Wozniak](https://supermemo.guru/wiki/Piotr_Wozniak). Although next iterations of SM algorithms [perform provably better](https://www.supermemo.com/help/smalg.htm#Anki_will_work_great_with_SM-2.2C_but_SM-5_is_superior) (in the context of knowledge retention), the most prevalent advantage of SM2 is its ease of implementation.
[SM2+](http://www.blueraja.com/blog/477/a-better-spaced-repetition-learning-algorithm-sm2) is a twist on SM2 algorithm that tries to correct some of SM2 shortcomings. For now, SM2+ will be used as this projects default sheduling algorithm. Althought it will be beneficial to the project to make scheduling algorithms pluggable at some point in the future.

## Inspiration
Project is inspired by [Anki](https://apps.ankiweb.net/), which is far more robust and mature software. If you would like to try spaced repetition in practice I highly recommend trying it out. I'm rolling my own app, because it's fun and Anki is not perfect. It's extension system is a bit clumsy to use. Things like markdown support, math rendering or syntax highlighting feel like an afterthought, not first class citizens.

## Quick Start

```shell
# install dependencies
npm install

# start docker containers
npm run docker:up

# start development mode
npm run dev
```

## Testing

#### Unit tests

```shell
npm run test:unit
```

#### Integration tests

```shell
npm run test:integration
```

#### Full test suite

```shell
npm run test:all
```

## Contributing
Be aware this is currently a solo project. It may be scrapped or completely rewritten in the future. Development may stop or stall without notice. That said, pull requests are more than welcome.

## License
[MIT](https://choosealicense.com/licenses/mit/)
