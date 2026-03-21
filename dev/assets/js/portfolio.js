/* =========================================================
   Portfolio Page: Category Filter
   ========================================================= */
(function () {
  const categoryChips = Array.from(document.querySelectorAll('.category-chip'));
  const portfolioGrid = document.getElementById('portfolioGrid');

  if (!categoryChips.length || !portfolioGrid) return;

  const thumbs = Array.from(portfolioGrid.querySelectorAll('.thumb-link'));

  function renderCategory(category) {
    thumbs.forEach((thumb) => {
      thumb.style.display = thumb.dataset.category === category ? '' : 'none';
    });
  }

  categoryChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      categoryChips.forEach((item) => item.classList.remove('active'));
      chip.classList.add('active');
      renderCategory(chip.dataset.category);
    });
  });

  const activeCategory = categoryChips.find((chip) => chip.classList.contains('active'))?.dataset.category || 'design';
  renderCategory(activeCategory);
})();
