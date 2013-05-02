var outside = 1;
function context(inside, time) {
    setTimeout(function() {
        console.log("Outside = [" + outside + "] Inside = [" + inside +"]");
    }, time);
}
context("A", 1000);
outside = 2;
context("B", 2000);