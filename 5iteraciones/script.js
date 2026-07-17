document.getElementById("calculate").addEventListener("click", () => {
    const num1 = parseFloat(document.getElementById("num1").value);
    const num2 = parseFloat(document.getElementById("num2").value);
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Limpiar resultados anteriores

    if (isNaN(num1) || isNaN(num2)) {
        resultsDiv.innerHTML = "<p style='color:red;'>Por favor ingresa ambos números.</p>";
        return;
    }

    const operations = [
        { name: "Suma", result: num1 + num2 },
        { name: "Resta", result: num1 - num2 },
        { name: "Multiplicación", result: num1 * num2 },
        { name: "División", result: num2 !== 0 ? (num1 / num2).toFixed(2) : "Error (div/0)" },
        { name: "Módulo", result: num2 !== 0 ? num1 % num2 : "Error (div/0)" }
    ];

    operations.forEach((op, index) => {
        const p = document.createElement("p");
        p.textContent = `Iteración ${index + 1} - ${op.name}: ${op.result}`;
        resultsDiv.appendChild(p);
    });
});