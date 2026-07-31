-- Exemplos de CRUD para o banco PostgreSQL (docker compose up -d)
-- Acesso: docker exec -it ps_vendas_db psql -U vendas -d vendas

-- ============ CREATE ============

-- Criar usuário (role: USER ou ADMIN)
INSERT INTO "User" (id, name, email, "passwordHash", role)
VALUES ('usr1', 'João', 'joao@email.com', '$2a$...hash', 'USER');

-- Criar produto (vínculo com o vendedor pelo sellerId)
INSERT INTO "Product" (id, name, description, price, "sellerId")
VALUES ('prod1', 'Notebook', 'Notebook 8GB', 2500.00, 'usr1');

-- Criar pedido (PENDING / COMPLETED)
INSERT INTO "Order" (id, "userId", total, status)
VALUES ('ord1', 'usr1', 2500.00, 'PENDING');

-- Criar item do pedido
INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
VALUES ('item1', 'ord1', 'prod1', 1, 2500.00);

-- ============ READ ============

SELECT * FROM "User";
SELECT * FROM "Product" WHERE "sellerId" = 'usr1';
SELECT * FROM "Order";
SELECT * FROM "OrderItem";

-- ============ UPDATE ============

UPDATE "Product" SET price = 2300.00 WHERE id = 'prod1';

-- ============ DELETE ============

DELETE FROM "Product" WHERE id = 'prod1';
