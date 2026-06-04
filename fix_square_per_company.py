content = open('src/App.jsx').read()

# 1. Agregar companyId al parametro
old1 = "const processSquarePayment = async (amountCents, note = '') => {"
new1 = "const processSquarePayment = async (amountCents, note = '', companyId = 'epw') => {"

if old1 in content:
    content = content.replace(old1, new1)
    print("OK: parametro companyId agregado")
else:
    print("NO ENCONTRADO: firma de funcion")

# 2. Usar credenciales de empresa
old2 = "    const payments = Square.payments(SQ.appId, SQ.locationId);"
new2 = "    const sqConfig = getSQForCompany(companyId);\n    const payments = Square.payments(sqConfig.appId, sqConfig.locationId);"

if old2 in content:
    content = content.replace(old2, new2)
    print("OK: credenciales por empresa")
else:
    print("NO ENCONTRADO: payments(SQ")

open('src/App.jsx', 'w').write(content)
print("Listo")