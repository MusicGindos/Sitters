const parent = {
    "_id": "10211424513464669",
    "email": "arel-g@hotmail.com",
    "name": "Arel Gindos",
    "gender": "male",
    "age": 100,
    "address": {
        "latitude": 32.086315,
        "longitude": 34.778055,
        "city": "Tel Aviv",
        "street": "Arlozorov",
        "houseNumber": 45
    },
    "coverPhoto": "https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/18425267_10212131166050542_6546868757873895299_n.jpg?oh=65b8e61525944693b9a168157709dcc5&oe=59BE247F",
    "profilePicture": "https://scontent.fsdv2-1.fna.fbcdn.net/v/t1.0-9/20638145_10212987718463817_6919398076724712809_n.jpg?oh=88ec013e416e70c014a5f02feda56ebd&oe=5A29F08E",
    "children": {
        "specialNeeds": [],
        "hobbies": [],
        "expertise": [],
        "name": "Boni",
        "age": 2
    },
    "invites": [],
    "isParent": true,
    "personality": [
        "Patient",
        "Witty",
        "Creative",
        "Energetic",
        "Sensitive",
        "Organized"
    ],
    "maxPrice": 40,
    "blacklist": [],
    "friends": [
        {
            "picture": "https://fb-s-a-a.akamaihd.net/h-ak-fbx/v/t1.0-1/p100x100/10710827_10152489063691819_5991342957621249328_n.jpg?oh=16976c510d2537c4deec386a72bba2c2&oe=59A72204&__gda__=1508306800_00c3028fc27bd5957cc1096f2f5c0d4e",
            "name": "Dassi Rosen",
            "id": "10154482510136819"
        },
        {
            "picture": "https://scontent.xx.fbcdn.net/v/t1.0-1/p100x100/11811412_10153262583766704_6032167086374488384_n.jpg?oh=758d47402c8c6dc39046b2de15442a4e&oe=59BF54D2",
            "name": "Miko Gindos",
            "id": "10155198366911704"
        },
        {
            "picture": "https://scontent.xx.fbcdn.net/v/t1.0-1/c1.0.720.720/p720x720/19275139_10213218212478813_6661778709354600332_n.jpg?oh=2d1128f5e569e2f5dec55e2d603363ef&oe=59FA74E0",
            "name": "Grisha Kondratenko",
            "id": "10212679441609878"
        },
        {
            "picture": "https://scontent.xx.fbcdn.net/v/t1.0-1/p100x100/18268465_1657813260914836_1782814508821183734_n.jpg?oh=6b68fcf67f04b7b2aa588f256ac00c87&oe=59C7F8F9",
            "name": "מיטל הלפרט",
            "id": "1656791977683631"
        }
    ],
    "languages": [],
    "preferedGender": "both"
};

const sitter = {
    "_id": "10213443706793813",
    "name": "Golan Sabo",
    "email": "lagolas123321@yahoo.com",
    "age": 28,
    "address": {
        "latitude": 32.091291,
        "longitude": 34.821742,
        "houseNumber": 19,
        "street": "Savyon",
        "city": "Ramat Gan"
    },
    "gender": "male",
    "coverPhoto": "https://scontent.xx.fbcdn.net/v/t31.0-8/s720x720/614435_4578988599471_2120553587_o.jpg?oh=9c9181af033e2872423d92df1ca8174e&oe=59BBB020",
    "profilePicture": "https://scontent.xx.fbcdn.net/v/t1.0-1/c0.0.100.100/p100x100/1907648_10203908846508265_5383816621420724800_n.jpg?oh=9ebafcae2b98ae669909995c896f5e22&oe=59BA19C6",
    "hourFee": 20,
    "availableNow": true,
    "lastInvite": "08/07/2017",
    "workingHours": {
        "sunday": [
            "Mornings",
            "Evenings",
            "Afternoon"
        ],
        "monday": [
            "Mornings",
            "Afternoon"
        ],
        "tuesday": [
            "Mornings",
            "Afternoon"
        ],
        "wednesday": [
            "Mornings",
            "Evenings"
        ],
        "thursday": [
            "Afternoon"
        ],
        "friday": [
            "Mornings",
            "Evenings",
            "Afternoon"
        ],
        "saturday": [
            "Afternoon"
        ]
    },
    "invites": [],
    "reviews": [],
    "expertise": [
        "math",
        "english",
        "physics",
        "history",
        "music",
        "sports"
    ],
    "specialNeeds": [
        "add",
        "adhd"
    ],
    "mobility": [
        "Car"
    ],
    "hobbies": [
        "air sports",
        "baking",
        "camping"
    ],
    "experience": 7,
    "maxAge": 99,
    "minAge": 1,
    "education": [
        "bachelor"
    ],
    "languages": [
        "hebrew",
        "english",
        "dutch",
        "hungarian",
        "japanese"
    ],
    "friends": [
        {
            "picture": "https://scontent.xx.fbcdn.net/v/t1.0-1/p100x100/10710827_10152489063691819_5991342957621249328_n.jpg?oh=dd60fea55924074ffa5de06d14965f74&oe=59580804",
            "name": "Dassi Rosen",
            "id": "10154482510136819"
        },
        {
            "picture": "https://scontent.xx.fbcdn.net/v/t1.0-1/c0.0.527.527/12190120_10207845413322192_1217865918457938910_n.jpg?oh=562631bd630a857b6dd70f04c42b4f3e&oe=59E4286E",
            "id": "10212679441609878",
            "name": "Grisha Kondratenko"
        }
    ],
    "isParent": false,
    "personality": [
        "Patient",
        "Witty",
        "Sensitive",
        "Organized",
        "Calm",
        "Enthusiastic"
    ],
    "motto": "All you need is love",
    "multipleInvites": [],
    "settings": {
        "allowNotification": true,
        "allowShowOnSearch": true
    }
};

module.exports.parent = parent;
module.exports.sitter = sitter;