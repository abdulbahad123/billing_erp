/**
 * Converts a number into Indian currency words format.
 * Example: 30180.50 -> "Thirty Thousand One Hundred Eighty and Fifty Paise"
 */
export const toWords = (num) => {
    const a = [
        "", "one ", "two ", "three ", "four ", "five ", "six ", "seven ", "eight ", "nine ", "ten ",
        "eleven ", "twelve ", "thirteen ", "fourteen ", "fifteen ", "sixteen ", "seventeen ", "eighteen ", "nineteen "
    ];
    const b = [
        "", "", "twenty ", "thirty ", "forty ", "fifty ", "sixty ", "seventy ", "eighty ", "ninety "
    ];

    const convertLessThanThousand = (n) => {
        if (n === 0) return "";
        let temp = "";
        if (n >= 100) {
            temp += a[Math.floor(n / 100)] + "hundred ";
            n %= 100;
        }
        if (n > 0) {
            if (n < 20) {
                temp += a[n];
            } else {
                temp += b[Math.floor(n / 10)] + a[n % 10];
            }
        }
        return temp;
    };

    const convert = (n) => {
        if (n === 0) return "zero";
        let str = "";
        const crore = Math.floor(n / 10000000);
        n %= 10000000;
        const lakh = Math.floor(n / 100000);
        n %= 100000;
        const thousand = Math.floor(n / 1000);
        n %= 1000;

        if (crore > 0) {
            str += convertLessThanThousand(crore) + "crore ";
        }
        if (lakh > 0) {
            str += convertLessThanThousand(lakh) + "lakh ";
        }
        if (thousand > 0) {
            str += convertLessThanThousand(thousand) + "thousand ";
        }
        if (n > 0) {
            str += convertLessThanThousand(n);
        }
        return str.trim();
    };

    const parts = String(num).split(".");
    const integerPart = parseInt(parts[0], 10) || 0;
    const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, "0").slice(0, 2), 10) : 0;

    let result = convert(integerPart);
    if (decimalPart > 0) {
        result += " and " + convert(decimalPart) + " paise";
    }
    return result.trim().replace(/\b\w/g, (c) => c.toUpperCase());
};
