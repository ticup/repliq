export class CookieList extends Set {
    add(name: String, count: number, client) {
        let cookie = client.create(Cookie, {name, count});
        this.add
    }
}


export class Cookie extends Repliq {
    name = "unnamed";
    count = 0;
    defaultPrice = 0;

    @sync
    adjust(delta) {
        this.set("count", this.get("count") + delta);
    }
}


export class Customer extends Repliq {
    name = "unnamed";
    cards = List();
    credit = 0;
}

