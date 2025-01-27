document.addEventListener('DOMContentLoaded', function() {
    const select = document.querySelector('.reports-dropdown');
    if (!select) return;
    
    const wrapper = select.parentElement;
    
    // Crear un div que actuará como nuestro select personalizado
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';
    
    // Crear el elemento que mostrará la opción seleccionada
    const selectedOption = document.createElement('div');
    selectedOption.className = 'selected-option';
    selectedOption.textContent = select.options[select.selectedIndex].text;
    
    // Crear el contenedor de opciones
    const optionsList = document.createElement('div');
    optionsList.className = 'options-list';
    
    // Ocultar el select original
    select.style.display = 'none';
    
    // Añadir las opciones
    Array.from(select.options).forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option.text;
        
        // Manejar el hover
        optionElement.addEventListener('mouseover', () => {
            optionElement.style.color = '#67d1d3';
        });
        
        optionElement.addEventListener('mouseout', () => {
            if (!optionElement.classList.contains('selected')) {
                optionElement.style.color = 'white';
            }
        });
        
        // Manejar el click
        optionElement.addEventListener('click', () => {
            select.selectedIndex = index;
            selectedOption.textContent = option.text;
            
            // Actualizar estilos
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
                opt.style.color = 'white';
            });
            optionElement.classList.add('selected');
            optionElement.style.color = '#67d1d3';
            
            optionsList.style.display = 'none';
            wrapper.classList.remove('open');
            
            // Disparar evento change en el select original
            select.dispatchEvent(new Event('change'));
        });
        
        optionsList.appendChild(optionElement);
    });
    
    // Manejar la apertura/cierre del select
    selectedOption.addEventListener('click', () => {
        const isOpen = optionsList.style.display === 'block';
        optionsList.style.display = isOpen ? 'none' : 'block';
        wrapper.classList.toggle('open');
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            optionsList.style.display = 'none';
            wrapper.classList.remove('open');
        }
    });
    
    // Añadir todo al DOM
    customSelect.appendChild(selectedOption);
    customSelect.appendChild(optionsList);
    wrapper.appendChild(customSelect);
}); 