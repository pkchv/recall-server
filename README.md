# Recall

Recall is web-based spaced repetition software. This repository hosts the server-side service built with [Node.js](https://nodejs.org), [Express](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/).

## Quick Start

```shell
# install dependencies
npm install

# start docker containers (docker required)
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

## Domain knowledge

#### Card

[Card](https://en.wikipedia.org/wiki/Flashcard) is a document with a single, isolated piece of knowledge, designed in a way that stimulates active recall during learning. Active recall is achieved by further dividing cards into cues (showed first) and reveals/answers (showed later).

#### Deck

Deck is a collection of related cards.

#### Spaced repetition

[Spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition) is a learning technique. The basic idea is to vary review frequency of concepts as to spend the most time possible acquiring new knowledge and relearning forgotten (or soon to be forgotten) concepts.

#### Scheduling algorithm

Scheduling algorithm realizes spaced repetition by scheduling review time of cards in a way that decreases users workload while increasing knowledge retention. Review time and frequency is usually determined based on self assessment of active recall.

One of the most extensively used scheduling algorithms for spaced repetition learning is [SM2 algorithm](https://www.supermemo.com/english/ol/sm2.htm) by [Piotr Wozniak](https://supermemo.guru/wiki/Piotr_Wozniak). Although next iterations of SM algorithms [perform better](https://www.supermemo.com/help/smalg.htm#Anki_will_work_great_with_SM-2.2C_but_SM-5_is_superior), the most prevalent advantage of SM2 is its ease of implementation. Probably unwritten consensus that it's good enough in addition to next iterations of SM algorithms being quite complex, while not being described in great detail also had something to do with it. :) For now, SM2 is used as projects default scheduling algorithm. Although I would love the challenge of implementing the latest and greatest someday.

## Inspiration

Project is inspired by [Anki](https://apps.ankiweb.net/), which is far more robust and mature software. If you would like to try spaced repetition, I recommend trying it out.
I've decided to create my own project, because Anki tends to be a bit clumsy for my own, specific, set of use cases. Things like markdown support, math rendering or syntax highlighting feel like an afterthought, not first class citizens.

## Contributing

Be aware this is a solo project. Development may stop or stall without notice. That said, pull requests are more than welcome.

## License

### Project

Project as a whole is licensed under [MIT](https://choosealicense.com/licenses/mit/) license.

### SM2 algorithm

Scheduler service implements SM2 algorithm, which is "open to the public". It seems the only requirement as stated [here](http://supermemopedia.com/wiki/Licensing_SuperMemo_Algorithm) is a copyright notice, which I'm gladly including below and in the scheduler service file. There are some minor tweaks and differences from the original SM2 algorithm. Please inspect scheduler service for details.

#### Algorithm SM-2, (C) Copyright SuperMemo World, 1991.

[supermemo.com](https://www.supermemo.com)

[supermemo.eu](http://www.supermemo.eu)