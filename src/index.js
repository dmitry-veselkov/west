import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        return [
            getCreatureDescription(this),
            ...super.getDescriptions(),
        ];
    }
}


class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for (const oppositeCard of oppositePlayer.table) {
            taskQueue.push(onDone => {
                if (oppositeCard) {
                    this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
                }
            });
        }

        taskQueue.continueWith(continuation);
    }
}


class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}


class Trasher extends Dog {
    constructor(name = 'Громила', power = 5) {
        super(name, power);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        return [...baseDescriptions, 'Получает на 1 меньше урона'];
    }
}


class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;')
    }
}


class Lad extends Dog {
    constructor(name = 'Браток', power = 2) {
        super(name, power)
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        return this.inGameCount * (this.inGameCount + 1) / 2
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1)

        super.doAfterComingIntoPlay(gameContext, continuation)
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1)

        super.doBeforeRemoving(continuation)
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - Lad.getBonus());
        });
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();

        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return [...baseDescriptions, 'Чем их больше, тем они сильнее'];
        }

        return baseDescriptions;

    }
}


const rogueDeleteProps = [
    'modifyDealedDamageToCreature',
    'modifyDealedDamageToPlayer',
    'modifyTakenDamage',
]

class Rogue extends Creature {
    constructor(name = 'Изгой', power = 5) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        const oppCardPrototype = Object.getPrototypeOf(oppositeCard);

        for (const prop of Object.getOwnPropertyNames(oppCardPrototype)) {
            if (rogueDeleteProps.includes(prop) && oppCardPrototype.hasOwnProperty(prop)) {
                if (!this.hasOwnProperty(prop)) {
                    this[prop] = oppCardPrototype[prop];
                }
                delete oppCardPrototype[prop];
            }
        }

        updateView();
        super.attack(gameContext, continuation);
    }
}

class Brewer extends Duck {
    constructor(name = 'Пивовар', power = 2) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer} = gameContext;

        const allCards = currentPlayer.table.concat(oppositePlayer.table);

        for (const card of allCards) {
            if (isDuck(card)) {
                taskQueue.push(onDone => {
                    card.maxPower += 1;
                    card.currentPower = Math.min(card.currentPower + 2, card.maxPower);
                    card.updateView();
                    card.view.signalHeal(onDone);
                });
            }
        }

        taskQueue.push(onDone => super.attack(gameContext, onDone));
        taskQueue.continueWith(continuation);
    }

}

const seriffStartDeck = [
    new Duck(),
    new Brewer(),
];
const banditStartDeck = [
    new Dog(),
    new Dog(),
    new Dog(),
    new Dog(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
