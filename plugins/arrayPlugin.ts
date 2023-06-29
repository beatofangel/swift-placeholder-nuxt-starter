export default defineNuxtPlugin(nuxtApp => {
  // @ts-ignore
  Array.prototype.normalize = function(field: any, range=[0, 1]) {
    var Self = this.filter(e=>e[field] !== "").map(e=>e[field]);
    const min = Math.min.apply(Math, Self);
    const max = Math.max.apply(Math, Self);
    const variation = (range[1] - range[0]) / (max - min);
    this.forEach(e => {
      const val = (range[0] + ((e[field] - min) * variation)).toFixed(2);
      e[field] = +val;
    });
    return this;
  };
})
