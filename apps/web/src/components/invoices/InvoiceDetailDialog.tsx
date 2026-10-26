import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { GenericConfirmDialog, GenericHeading, GenericText } from '@/components/ui';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';
import { formatInvoiceCreatedAt } from '@/lib/invoices/format';
import { formatInvoiceLineQuantity, invoiceLineTotalBs } from '@/lib/invoices/lines';
import { InvoiceTotalsCard } from '@/components/invoices/InvoiceTotalsCard';
import { breakdownFromInvoice } from '@/lib/invoices/totals';
import { formatBs, formatUsd } from '@/lib/money';
import { InvoicePaymentDialog } from '@/components/invoices/InvoicePaymentDialog';
import type { Invoice } from '@/lib/types';

/** Misma plantilla en encabezado y filas para alinear Cant. / USD / Bs. */
const productLinesGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 2.75rem 4.5rem 7.25rem',
  columnGap: 2,
  alignItems: 'center',
} as const;

type Props = {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onDelete: (invoice: Invoice) => void | Promise<void>;
  onInvoiceUpdated?: (invoice: Invoice) => void;
};

export function InvoiceDetailDialog({ invoice, open, onClose, onDelete, onInvoiceUpdated }: Props) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setDeleteConfirmOpen(false);
      setPaymentOpen(false);
    }
  }, [open]);

  if (!invoice) {
    return null;
  }

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(invoice);
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const lines = invoice.lines ?? [];
  const lineCount = lines.length || invoice.lineCount;
  const productsLabel = `${lineCount} producto${lineCount === 1 ? '' : 's'}`;

  return (
    <>
    <Dialog.Root
      open={open}
      onOpenChange={e => {
        if (!e.open) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner
          p={{ base: 0, md: 4 }}
          alignItems={{ base: 'stretch', md: 'center' }}
          justifyContent="center"
        >
          <Dialog.Content
            maxW={{ base: '100%', md: '32rem', lg: '40rem' }}
            w="full"
            h={{ base: '100dvh', md: 'auto' }}
            maxH={{ base: '100dvh', md: 'min(92dvh, 44rem)' }}
            m={{ base: 0, md: 'auto' }}
            borderRadius={{ base: 0, md: 'xl' }}
            boxShadow={{ base: 'none', md: 'xl' }}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            bg="gray.50"
          >
            <Dialog.Header
              flexShrink={0}
              bg="white"
              borderBottomWidth="1px"
              borderColor="gray.200"
              py={3}
              px={4}
            >
              <Stack gap={2} pr={8}>
                <Flex align="center" gap={2} flexWrap="wrap" minW={0}>
                  <GenericText variant="strong" color="red.600" fontSize="sm" lineClamp={1}>
                    Nro: {invoice.number}
                  </GenericText>
                  <InvoiceStatusBadge status={invoice.status} />
                </Flex>
                <GenericText variant="caption">{formatInvoiceCreatedAt(invoice.createdAt)}</GenericText>
                {invoice.customerName && (
                  <GenericText variant="body" fontSize="xs">
                    Cliente: {invoice.customerName}
                  </GenericText>
                )}
              </Stack>
              <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body flex="1" minH={0} overflowY="auto" px={4} py={4}>
              <Stack gap={3}>
                <InvoiceTotalsCard
                  breakdown={breakdownFromInvoice(invoice)}
                  headerRight={productsLabel}
                  creditUsd={invoice.creditUsd}
                  paymentsMode="used"
                />

                <Box
                  bg="white"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  px={3}
                  py={2.5}
                  pb={3}
                >
                  <GenericHeading variant="section" fontSize="sm" mb={2}>
                    Productos ({lineCount})
                  </GenericHeading>
                  {lines.length === 0 ? (
                    <GenericText variant="muted" fontSize="xs">
                      Sin líneas de detalle
                    </GenericText>
                  ) : (
                    <>
                      <Box {...productLinesGrid} pb={1.5} borderBottomWidth="1px" borderColor="gray.200">
                        <GenericText variant="caption">Producto</GenericText>
                        <GenericText variant="caption" textAlign="right">
                          Cant.
                        </GenericText>
                        <GenericText variant="caption" textAlign="right">
                          USD
                        </GenericText>
                        <GenericText variant="caption" textAlign="right">
                          Bs
                        </GenericText>
                      </Box>
                      <Stack gap={0}>
                        {lines.map((line, i) => (
                          <Box
                            key={`${line.productId}-${i}`}
                            {...productLinesGrid}
                            py={2}
                            borderTopWidth={i === 0 ? 0 : '1px'}
                            borderColor="gray.100"
                          >
                            <GenericText variant="body" fontSize="xs" minW={0} lineClamp={2}>
                              {line.productName}
                            </GenericText>
                            <GenericText variant="muted" fontSize="xs" textAlign="right">
                              {formatInvoiceLineQuantity(line.quantity, line.unit)}
                            </GenericText>
                            <GenericText variant="body" fontSize="xs" textAlign="right" whiteSpace="nowrap">
                              {formatUsd(line.lineTotalUsd)}
                            </GenericText>
                            <GenericText
                              variant="muted"
                              fontSize="xs"
                              textAlign="right"
                              whiteSpace="nowrap"
                            >
                              {formatBs(invoiceLineTotalBs(line, invoice.rateApplied))}
                            </GenericText>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer
              flexShrink={0}
              bg="white"
              borderTopWidth="1px"
              borderColor="gray.200"
              px={4}
              py={3}
              gap={2}
            >
              <Button
                flex="1"
                variant="outline"
                colorPalette="red"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Eliminar
              </Button>
              <Button
                flex="1"
                colorPalette="green"
                size="sm"
                onClick={() => setPaymentOpen(true)}
              >
                {invoice.status === 'PENDING' ? 'Pagar' : 'Editar pago'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>

      <GenericConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar factura"
        message={`¿Eliminar la factura Nro: ${invoice.number}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => void handleConfirmDelete()}
        loading={deleting}
      />

      <InvoicePaymentDialog
        invoice={invoice}
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSaved={updated => onInvoiceUpdated?.(updated)}
      />
    </>
  );
}
