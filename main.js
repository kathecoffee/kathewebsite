/* Hero: auto-advance slides every 6s, pause on hover, resume on manual click */
(function () {
  var radios = ['heroR1', 'heroR2', 'heroR3']
    .map(function (id) { return document.getElementById(id); });
  if (!radios[0]) return;

  var current = radios.findIndex(function (r) { return r.checked; });
  if (current === -1) current = 0;

  var AUTOPLAY_MS = 6000;
  var timer = null;

  function next() {
    current = (current + 1) % radios.length;
    radios[current].checked = true;
  }
  function start() {
    stop();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stop() {
    if (timer) clearInterval(timer);
  }

  var heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stop);
    heroSection.addEventListener('mouseleave', start);
  }

  // if the user manually clicks an arrow/dot, sync our counter and restart the timer
  radios.forEach(function (r) {
    r.addEventListener('change', function () {
      current = radios.indexOf(r);
      start();
    });
  });

  start();
})();

/* About-section image carousel: cards rotate, center one is highlighted,
   auto-rotates on a timer, loops infinitely. */
(function () {
  var carousel = document.querySelector('[data-video-carousel]');
  if (!carousel) return;

  var stage = carousel.querySelector('.about-video-stage');
  var track = carousel.querySelector('[data-track]');
  var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-dot]'));

  var activeIndex = 0;
  var AUTO_ROTATE_MS = 3500;
  var timer = null;

  function positionTrack() {
    var slide = slides[activeIndex];
    var translateX = (stage.clientWidth / 2) - (slide.offsetWidth / 2) - slide.offsetLeft;
    track.style.transform = 'translateX(' + translateX + 'px)';
  }

  function goTo(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeIndex);
    });

    positionTrack();
  }

  function startAutoRotate() {
    stopAutoRotate();
    timer = setInterval(function () { goTo(activeIndex + 1); }, AUTO_ROTATE_MS);
  }

  function stopAutoRotate() {
    if (timer) clearInterval(timer);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAutoRotate();
    else startAutoRotate();
  });

  window.addEventListener('resize', positionTrack);

  goTo(0);
  startAutoRotate();
})();

/* Booking form → WhatsApp handoff */
(function () {
  var form = document.getElementById('bookingForm');
  if (!form) return;

  var CAFE_WHATSAPP_NUMBER = '919488845678'; // replace with your real number, country code + number, no + or spaces

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.bookingName.value.trim();
    var phone = form.bookingPhone.value.trim();
    var guests = form.bookingGuests.value.trim();
    var date = form.bookingDate.value;
    var time = form.bookingTime.value;
    var note = form.bookingNote.value.trim();

    var message =
      'New Table Reservation — Kathe Coffee%0A%0A' +
      'Name: ' + encodeURIComponent(name) + '%0A' +
      'Phone: ' + encodeURIComponent(phone) + '%0A' +
      'Guests: ' + encodeURIComponent(guests) + '%0A' +
      'Date: ' + encodeURIComponent(date) + '%0A' +
      'Time: ' + encodeURIComponent(time) +
      (note ? '%0ANote: ' + encodeURIComponent(note) : '');

var whatsappUrl = 'https://wa.me/' + CAFE_WHATSAPP_NUMBER + '?text=' + message;

var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

var msg = form.querySelector('.booking-form__msg');
    if (msg) {
      msg.textContent = 'Your seat is booked! We\'ve opened WhatsApp — just hit send to confirm with us.';
    }

    form.reset();

    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, '_blank');
    }
  });
})();

/* Gallery stack:
   Desktop — pins the section in the viewport while the user scrolls,
   revealing photos one by one based on scroll progress.
   Mobile — no pinning; photos just reveal immediately since the
   section flows normally in that layout. */
(function () {
  var scrollEl = document.querySelector('[data-gallery-scroll]');
  if (!scrollEl) return;

  var items = Array.prototype.slice.call(
    scrollEl.querySelectorAll('[data-gallery-item]')
  );
  if (!items.length) return;

  var ticking = false;

  function update() {
    ticking = false;

    if (window.innerWidth <= 900) {
      items.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    var rect = scrollEl.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return;

    var progress = -rect.top / total;
    progress = Math.max(0, Math.min(1, progress));

    items.forEach(function (item, i) {
      var threshold = i / items.length;
      if (progress >= threshold) {
        item.classList.add('is-visible');
      } else {
        item.classList.remove('is-visible');
      }
    });
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();


/* Booking form: phone +91 auto-format, date limited to current month,
   time limited 11:00–22:00 */

(function () {
  var phone = document.getElementById('bookingPhone');
  var date = document.getElementById('bookingDate');
  var time = document.getElementById('bookingTime');
  if (!phone && !date && !time) return;

  if (phone) {
    phone.addEventListener('input', function () {
      var digits = phone.value.replace(/\D/g, '').replace(/^91/, '');
      digits = digits.slice(0, 10);
      phone.value = digits ? '+91 ' + digits : '';
    });
  }

  if (date) {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var firstDay = y + '-' + m + '-01';
    var lastDate = new Date(y, now.getMonth() + 1, 0).getDate();
    var lastDay = y + '-' + m + '-' + String(lastDate).padStart(2, '0');
    date.min = firstDay;
    date.max = lastDay;
  }

  if (time) {
    time.addEventListener('change', function () {
      if (!time.value) return;
      var minTime = '11:00';
      var maxTime = '22:00';
      if (time.value < minTime || time.value > maxTime) {
        alert('Please choose a time between 11:00 AM and 10:00 PM.');
        time.value = '';
        time.focus();
      }
    });
  }

  var form = phone ? phone.closest('form') : null;
  if (form && time) {
    form.addEventListener('submit', function (e) {
      if (time.value < '11:00' || time.value > '22:00') {
        e.preventDefault();
        alert('Please choose a time between 11:00 AM and 10:00 PM.');
        time.focus();
      }
    });
  }
})();


// offer card
document.addEventListener('DOMContentLoaded', () => {
  // Select all close buttons on the offer cards
  const closeBtns = document.querySelectorAll('.close-card-btn');

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // Find the card containing this close button
      const card = e.target.closest('.offer-card');
      if (!card) return;

      // Hide the card
      card.classList.add('hidden');

      // Re-show the card after 15 seconds (15,000 milliseconds)
      setTimeout(() => {
        card.classList.remove('hidden');
      }, 5000);
    });
  });
});