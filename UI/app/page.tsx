"use client";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (arg: any) => fetch(arg).then((res) => res.json());

interface Ville {
  id: number;
  code_insee: string;
  nom: string;
  code_postal: string;
}

interface Criterion {
  id: number;
  criterion: string;
  type: string;
  sort: number;
}

export default function Home() {
  let { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_HOST}/shortlist`,
    fetcher,
    { keepPreviousData: true },
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selected, setSelected] = useState<any>({ criterion_id: null, ville_id: null, value: null });

  if (!data) {
    return (
      <section className="flex flex-col items-center justify-center gap-4">
        <Spinner label="Loading..." />
      </section>
    );
  }

  const shortlist = data.items[0];

  const getValue = (criterion: Criterion, ville: Ville) => {
    const value = shortlist.values.find((i: any) => i.criterion_id === criterion.id && i.ville_id === ville.id)?.value;

    switch (criterion.type) {
      case "bool":
        return Number(value) ? "✅" : "";
      default:
        return value;
    }

  };

  const openEdit = (criterion: Criterion, ville: Ville) => {
    const value = shortlist.values.find((i: any) => i.criterion_id === criterion.id && i.ville_id === ville.id)?.value || "";

    setSelected({ criterion_id: criterion.id, ville_id: ville.id, value });
    onOpen();
  };

  const valueUpdated = (value: string) => {
    setSelected({ ...selected, value });
  }

  const updateValue = (close: Function) => {
    fetch(`${process.env.NEXT_PUBLIC_API_HOST}/shortlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selected),
    }).then(() => {
      let item = shortlist.values.find((i: any) => i.criterion_id === selected.criterion_id && i.ville_id === selected.ville_id);

      if (item) {
        item.value = selected.value;
      } else {
        shortlist.values.push({ ...selected });
      }
      close();
    });
  };

  const generateHeaders = () => {
    const cells = [];

    cells.push(<TableColumn key="header_null">&nbsp;</TableColumn>);

    shortlist.villes.map((ville: Ville) => {
      cells.push(
        <TableColumn
          key={`header_${ville.id}`}
          align="center"
        >
          {ville.nom}
        </TableColumn>
      );
    });

    return cells;
  }

  const generateRow = (criterion: Criterion) => {
    const cells = [];

    cells.push(<TableCell key={`criterion_${criterion.id}`}>{criterion.criterion}</TableCell>);

    shortlist.villes.forEach((ville: Ville) => {
      cells.push(
        <TableCell
          key={`${criterion.id}-${ville.id}`}
          align="center"
          onDoubleClick={() => openEdit(criterion, ville)}
        >
          {getValue(criterion, ville)}
        </TableCell>
      );
    });

    return cells;
  };

  let editForm = <Textarea
    defaultValue={shortlist.values.find((i: any) => i.criterion_id === selected.criterion_id && i.ville_id === selected.ville_id)?.value || ""}
    onValueChange={valueUpdated}
  />

  if (selected.criterion_id) {
    const { type } = shortlist.criteria.find((c: Criterion) => c.id === selected.criterion_id);

    switch (type) {
      case "bool":
        editForm = <><Switch defaultSelected={selected.value === "1"} onValueChange={(checked) => valueUpdated(checked ? "1" : "0")} /></>
    }
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Updating &quot;{shortlist.criteria.find((c: Criterion) => c.id === selected.criterion_id).criterion}&quot; for {shortlist.villes.find((v: Ville) => v.id === selected.ville_id).nom}
              </ModalHeader>
              <ModalBody>
                {editForm}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={() => updateValue(onClose)}>
                  Update
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Table
        isStriped
        color="secondary"
        selectionMode="single"
      >
        <TableHeader>
          {generateHeaders()}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {shortlist.criteria.map((criterion: Criterion) => (
            <TableRow key={criterion.id}>
              {generateRow(criterion)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
